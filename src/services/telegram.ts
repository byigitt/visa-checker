import { Telegraf } from "telegraf";
import type { Context } from "telegraf";
import type { Update } from "telegraf/typings/core/types/typegram";
import type { VisaAppointment } from "../types";
import { config } from "../config/environment";

interface TelegramError {
  response?: {
    parameters?: {
      retry_after?: number;
    };
  };
}

/**
 * Telegram servis sınıfı
 * Telegram mesajlarının gönderilmesi ve bot yönetiminden sorumludur
 */
class TelegramService {
  private bot: Telegraf;
  private messageCount = 0;
  private lastReset = Date.now();
  private resetInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.bot = new Telegraf(config.telegram.botToken);
    this.setupErrorHandler();
    this.startRateLimitReset();
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  
  /**
   * Bot hata yakalayıcısını ayarlar
   * Bot çalışırken oluşabilecek hataları yakalar ve loglar
   */
  private setupErrorHandler(): void {
    this.bot.catch((err: unknown, ctx: Context<Update>) => {
      console.error("Telegram bot hatası:", {
        error: err,
        updateType: ctx.updateType,
        chatId: ctx.chat?.id,
      });
    });
  }

  /**
   * Rate limit sayacını sıfırlar
   * Her dakika başında çalışır
   */
  private startRateLimitReset(): void {
    // Önceki interval'i temizle
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }

    this.resetInterval = setInterval(() => {
      if (this.messageCount > 0) {
        console.log(
          `Rate limit sayacı sıfırlandı. Önceki mesaj sayısı: ${this.messageCount}`
        );
      }
      this.messageCount = 0;
      this.lastReset = Date.now();
    }, 60000); // Her dakika
  }

  /**
   * Rate limit kontrolü yapar ve gerekirse bekler
   */
  private async handleRateLimit(): Promise<void> {
    if (this.messageCount >= config.telegram.rateLimit) {
      const timeToWait = 60000 - (Date.now() - this.lastReset);
      if (timeToWait > 0) {
        console.log(
          `Rate limit aşıldı. ${Math.ceil(
            timeToWait / 1000
          )} saniye bekleniyor...`
        );
        await new Promise((resolve) => setTimeout(resolve, timeToWait));
        this.messageCount = 0;
        this.lastReset = Date.now();
      }
    }
  }

  formatMessage(appointment: VisaAppointment): string {
    const lastChecked = new Date(appointment.last_checked_at);
  
    const formatDate = (date: Date | string): string => {
      if (typeof date === "string") date = new Date(date);
      return date.toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
        dateStyle: "medium",
        timeStyle: "medium",
      });
    };
  
    const formatAvailableDate = (dateStr?: string): string => {
      return dateStr ? this.escapeHtml(dateStr) : "Bilgi Yok";
    };
  
    return [
      `<b>YENİ RANDEVU</b>`,
      ``,
      `<b>Durum:</b> ${this.escapeHtml(appointment.status)}`,
      `<b>Merkez:</b> ${this.escapeHtml(appointment.center)}`,
      `<b>Ülke/Misyon:</b> ${this.escapeHtml(appointment.country_code.toUpperCase())} -> ${this.escapeHtml(appointment.mission_code.toUpperCase())}`,
      `<b>Kategori:</b> ${this.escapeHtml(appointment.visa_category)}`,
      `<b>Tip:</b> ${this.escapeHtml(appointment.visa_type)}`,
      `<b>Son Müsait Tarih:</b> ${formatAvailableDate(appointment.last_available_date)}`,
      `<b>Takip Sayısı:</b> ${appointment.tracking_count}`,
      `<b>Son Kontrol:</b> ${this.escapeHtml(formatDate(lastChecked))}`,
    ].join("\n");
  }
  
  /**
   * Yeni randevu bilgisini Telegram kanalına gönderir
   * @returns Mesaj başarıyla gönderildiyse true, hata oluştuysa false döner
   */
  async sendNotification(appointment: VisaAppointment): Promise<boolean> {
    try {
      await this.handleRateLimit();

      await this.bot.telegram.sendMessage(
        config.telegram.channelId,
        this.formatMessage(appointment),
        {
          parse_mode: "HTML",
          link_preview_options: {
            is_disabled: true,
          },
        }
      );

      this.messageCount++;
      return true;
    } catch (error) {
      if (this.isTelegramError(error)) {
        const retryAfter = error.response?.parameters?.retry_after;
        if (retryAfter) {
          const waitTime = retryAfter * 1000;
          console.log(
            `Telegram rate limit aşıldı. ${retryAfter} saniye bekleniyor...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return this.sendNotification(appointment);
        }
      }
      console.error("Telegram mesajı gönderilirken hata oluştu:", error);
      return false;
    }
  }

  /**
   * Hata nesnesinin Telegram hatası olup olmadığını kontrol eder
   */
  private isTelegramError(error: unknown): error is TelegramError {
    return (
      error !== null &&
      typeof error === "object" &&
      "response" in error &&
      error.response !== null &&
      typeof error.response === "object" &&
      "parameters" in error.response
    );
  }

  /**
   * Servis kapatılırken interval'i temizle
   */
  cleanup(): void {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
  }
}

export const telegramService = new TelegramService();
