# ÖNEMLİ BİLGİLENDİRME
```
uygulamamı kullanan herkese selamlar,

anlık olarak bir schengen vize arayışım yok, 
bu yüzden vfs global websitesine erişimim de yok.

bana randevulara erişebilen ve yeni sistemde nasıl 
eriştiğini gösterebilen birisi olursa, selenium/headless-chrome ile 
bunu implemente edeceğim (tekrardan işe yarar hale getireceğim).

mailim (baris@bayburt.lu) veya linkedinim (https://linkedin.com/in/bbayburtlu) 
üzerinden ulaşıp bilgilerinizi sağlarsanız hem kendinize, 
hem de mağdur olan tüm insanlara yardımcı olursunuz.

çok teşekkürler şimdiden!
```

# 🔍 Schengen Vize Randevu Takip Botu

Bu bot, Schengen vizesi için randevu durumlarını otomatik olarak takip eder ve uygun randevular bulunduğunda Telegram üzerinden bildirim gönderir.

## 📋 Özellikler

- 🔄 Belirtilen aralıklarla otomatik randevu durumu kontrolü
- 🌍 Kaynak ülke (`country_code`), hedef ülke (`mission_code`) ve şehir (`center` içinde) bazında filtreleme
- 🏷️ Belirli vize tiplerine (`visa_type`) göre filtreleme
- 🚦 Sadece 'açık' (`open`) veya 'bekleme listesi açık' (`waitlist_open`) durumundaki randevuları bildirme
- 📱 Telegram üzerinden anlık bildirimler
- ⏰ Özelleştirilebilir kontrol sıklığı (Cron formatı)
- 🚫 Telegram API rate limit yönetimi (dakikada gönderilen mesaj sayısını ve yeniden deneme süresini ayarlar)
- 🔍 Detaylı hata ayıklama modu (`DEBUG=true`)
- 💾 Gönderilen bildirimleri ID bazlı önbelleğe alarak tekrar gönderimi engelleme

## 🛠 Sistem Gereksinimleri

### Yazılım Gereksinimleri

- Node.js (v16 veya üzeri)
- Paket yöneticisi (npm, yarn veya pnpm)
- Telegram Bot Token'ı
- Telegram Kanal/Grup ID'si
- **Alternatif:** Docker

#### Docker Kurulumu

Docker'ı sisteminize kurmak için:

- **Windows/Mac:**  
  [Docker Desktop](https://www.docker.com/products/docker-desktop/) uygulamasını indirip kurun.

- **Linux (Ubuntu/Debian):**
  
  ```bash
  sudo apt update
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh ./get-docker.sh

  # post installation steps
  sudo groupadd docker
  sudo usermod -aG docker $USER
  # Log out and log back in so that your group membership is re-evaluated.
  ```

Kurulumdan sonra terminalde `docker --version` ve `docker compose version` komutları ile kurulumun başarılı olduğunu doğrulayabilirsiniz.

### Donanım/Hosting Gereksinimleri

Bot'un sürekli çalışabilmesi için aşağıdaki seçeneklerden birine ihtiyacınız var:

1. **VPS (Virtual Private Server) - Önerilen 🌟**

   - 7/24 kesintisiz çalışma
   - Düşük maliyetli (aylık 50-100 lira)
   - Önerilen sağlayıcılar (dolar bazlı): DigitalOcean, Linode, Vultr, OVH
   - Önerilen sağlayıcılar (türk lirası bazlı): DeHost, Natro, Turhost

2. **Kişisel Bilgisayar**

   - 7/24 açık kalması gerekir
   - Elektrik kesintilerinden etkilenir
   - İnternet bağlantısı sürekli olmalı
   - Bilgisayarın uyku moduna geçmesi engellenmelidir

3. **Raspberry Pi**
   - Düşük güç tüketimi
   - 7/24 çalıştırılabilir
   - Ekonomik çözüm
   - Kurulum biraz teknik bilgi gerektirir

> ⚠️ **Önemli Not**: Bot'un randevuları kaçırmaması için sürekli çalışır durumda olması gerekir. VPS kullanımı, kesintisiz çalışma ve düşük maliyet açısından en ideal çözümdür.

## 🛠️ Kurulum

### Gereksinimler

- Node.js (v16 veya üzeri)
- Paket yöneticisi (npm, yarn veya pnpm)
- Telegram Bot Token'ı
- Telegram Kanal/Grup ID'si

### 1. Telegram Bot Oluşturma

1. Telegram'da [@BotFather](https://t.me/botfather) ile konuşma başlatın
2. `/newbot` komutunu gönderin
3. Bot için bir isim belirleyin
4. Bot için bir kullanıcı adı belirleyin (sonu 'bot' ile bitmeli)
5. BotFather size bir **API Token** verecek, bu token'ı kaydedin.

### 2. Telegram Kanal ID'si Alma

1. Bir Telegram kanalı veya grubu oluşturun.
2. Oluşturduğunuz botu bu kanala/gruba **ekleyin ve yönetici yetkisi verin**.
3. Kanala/gruba herhangi bir mesaj gönderin.
4. Tarayıcınızda şu adresi açın: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
   - `<BOT_TOKEN>` kısmını **adım 1'de aldığınız API Token** ile değiştirin.
5. Açılan sayfada (JSON çıktısı) `"chat":{"id":-100xxxxxxxxxx}` şeklinde bir alan arayın.
6. `id` değerini (başındaki eksi işareti dahil) kaydedin. Bu sizin **Kanal/Grup ID'nizdir** (örn: `-100123456789`).

### 3. Projeyi Kurma

1. Projeyi bilgisayarınıza indirin veya klonlayın:

```bash
git clone https://github.com/byigitt/visa-checker.git
cd visa-checker
```

2. Gerekli Node.js paketlerini yükleyin:

```bash
# npm kullanıyorsanız
npm install

# yarn kullanıyorsanız
yarn install

# pnpm kullanıyorsanız
pnpm install
```

3. `.env.example` dosyasını kopyalayarak `.env` adında yeni bir dosya oluşturun. Windows'ta:

```powershell
copy .env.example .env
```

Linux/macOS'ta:

```bash
cp .env.example .env
```

4. Yeni oluşturduğunuz `.env` dosyasını bir metin düzenleyici ile açın ve aşağıdaki gibi düzenleyin:

```env
# .env Dosyası Örneği

# Telegram Yapılandırması / Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here # Adım 1'de aldığınız Bot Token
TELEGRAM_CHAT_ID=your_chat_id_here # Adım 2'de aldığınız Kanal/Grup ID (örn: -100123456789)

# Opsiyonel Telegram Ayarları (Varsayılan değerleri kullanmak için boş bırakılabilir)
TELEGRAM_RATE_LIMIT_MINUTES= # Default: 15 (Dakikada gönderilecek maksimum mesaj)
TELEGRAM_RETRY_AFTER=        # Default: 5000 (Rate limit durumunda bekleme süresi ms)

# Uygulama Yapılandırması / Application Configuration
CHECK_INTERVAL=*/5 * * * *  # Kontrol sıklığı (Cron formatı, varsayılan: 5 dakikada bir)
TARGET_COUNTRY=tur          # Takip edilecek KAYNAK ülke kodu (API'deki country_code, örn: tur, gbr, are). 
                            # Tüm kaynak ülkeler için 'all' yazılabilir.

# Randevu Filtreleme / Appointment Filtering
CITIES=Ankara,Istanbul      # Takip edilecek şehirler (API'deki center alanından çıkarılır, virgülle ayrılır, boş bırakılırsa tüm şehirler). Örnek: "Netherlands Visa Application Centre - Ankara" için "Ankara".
MISSION_COUNTRY=nld,fra     # Takip edilecek HEDEF ülke kodları (API'deki mission_code, küçük harfle, virgülle ayrılır, örn: nld,fra,deu). Bu alan zorunludur.
VISA_SUBCATEGORIES=Tourism,Business # Takip edilecek vize tipleri (API'deki visa_type alanıyla kısmi eşleşme, virgülle ayrılır, boş bırakılırsa tüm tipler). Örnek: "TOURISM VISA APPLICATION", "BUSINESS VISA APPLICATION"

# Hata Ayıklama / Debug Configuration
DEBUG=false                 # Detaylı logları görmek için 'true' yapın

# Opsiyonel API Ayarları (Varsayılanları kullanmak için boş bırakılabilir)
VISA_API_URL=                # API URL (Default: https://api.visasbot.com/api/visa/list)
MAX_RETRIES=                 # API hata deneme sayısı (Default: 3)
RETRY_DELAY_BASE=           # API denemeleri arası bekleme (Default: 1000ms)

# Opsiyonel Önbellek Ayarları (Varsayılanları kullanmak için boş bırakılabilir)
MAX_CACHE_SIZE=              # Maksimum önbellek boyutu (Default: 1000)
CACHE_CLEANUP_INTERVAL=      # Önbellek temizleme sıklığı (Default: 86400000ms - 24 saat)
```

**Önemli `.env` Açıklamaları:**

- `TARGET_COUNTRY`: API yanıtındaki `country_code` alanına göre filtreler (örn: `tur`, `gbr`). Tüm ülkeler için `all` yazılabilir. Varsayılan: `tur`.
- `CITIES`: API yanıtındaki `center` alanının sonundaki şehir ismine göre filtreler. Örnek `center` değerleri: `Netherlands Visa Application Centre - Antalya`, `Bulgaria Visa Application Center, Ankara`. Virgülle ayrılır. Boş bırakılırsa şehir filtresi uygulanmaz.
- `MISSION_COUNTRY`: API yanıtındaki `mission_code` alanına göre (küçük harfle) filtreler (örn: `nld`, `fra`). Virgülle ayrılır. Bu alan zorunludur, varsayılan olarak `nld` kullanılır eğer boş bırakılırsa.
- `VISA_SUBCATEGORIES`: API yanıtındaki `visa_type` alanının içinde geçen metinlere göre (büyük/küçük harf duyarsız) filtreler (örn: `Tourism`, `Job Seeker`). Virgülle ayrılır. Boş bırakılırsa vize tipi filtresi uygulanmaz.

5. TypeScript kodunu JavaScript'e derleyin:

```bash
# npm kullanıyorsanız
npm run build

# yarn kullanıyorsanız
yarn build

# pnpm kullanıyorsanız
pnpm build
```

### 4. Botu Çalıştırma

1. Geliştirme modunda (kod değişikliklerinde otomatik yeniden başlar):

```bash
# npm kullanıyorsanız
npm run dev

# yarn kullanıyorsanız
yarn dev

# pnpm kullanıyorsanız
pnpm dev
```

2. Production modunda (derlenmiş kodu çalıştırır):

```bash
# npm kullanıyorsanız
npm start

# yarn kullanıyorsanız
yarn start

# pnpm kullanıyorsanız
pnpm start
```

Bot başarıyla başladığında konsolda `Vize randevu kontrolü başlatıldı...` mesajını ve yapılandırma detaylarını görmelisiniz.

---

## 🐳 Docker ile Çalıştırma

Node.js veya paket yöneticisi kurmadan, Docker ile hızlıca başlatabilirsiniz. .env dosyasını düzenledikten sonra aşağıdaki adımları izleyin:

### Botu başlatmak için

```bash
docker compose up -d --build
```

### Botu durdurmak için

```bash
docker compose down
```

### Logları görmek için

```bash
docker compose logs -f
```

---

## ⚙️ Yapılandırma Seçenekleri (.env Dosyası)

### Telegram Ayarları

- `TELEGRAM_BOT_TOKEN`: **Zorunlu**. Telegram bot token'ınız.
- `TELEGRAM_CHAT_ID`: **Zorunlu**. Telegram kanal/grup ID'niz.
- `TELEGRAM_RATE_LIMIT_MINUTES` (Opsiyonel): Dakikada gönderilebilecek maksimum mesaj sayısı (Varsayılan: 15).
- `TELEGRAM_RETRY_AFTER` (Opsiyonel): Rate limit aşıldığında beklenecek süre (milisaniye) (Varsayılan: 5000).

### Randevu Takip Ayarları

- `CHECK_INTERVAL` (Opsiyonel): Randevu kontrolü sıklığı (Cron formatı, Varsayılan: `*/5 * * * *` - 5 dakikada bir).
- `TARGET_COUNTRY` (Opsiyonel): Takip edilecek kaynak ülke kodu (API'deki `country_code`, küçük harfle, örn: `tur`, `gbr`). Varsayılan: `tur`. Tüm ülkeler için `all` yazılabilir.
- `CITIES` (Opsiyonel): Takip edilecek şehirler (API'deki `center` alanından çıkarılır, virgülle ayrılır, büyük/küçük harf duyarsız). Boş bırakılırsa filtre uygulanmaz. Örnek `center` değerleri: `Netherlands Visa Application Centre - Antalya` için `Antalya`, `Bulgaria Visa Application Center, Ankara` için `Ankara`.
- `MISSION_COUNTRY` (Opsiyonel): Randevusu takip edilecek **hedef ülke kodları** (API'deki `mission_code`, küçük harfle, virgülle ayrılır, örn: `nld,fra,deu`). Boş bırakılırsa varsayılan olarak `nld` kullanılır.
- `VISA_SUBCATEGORIES` (Opsiyonel): Takip edilecek vize tipleri (API'deki `visa_type` alanıyla kısmi eşleşme, virgülle ayrılır, büyük/küçük harf duyarsız). Boş bırakılırsa filtre uygulanmaz. Örnekler: `Tourism`, `Job Seeker`, `Family visit`.

### Sistem Ayarları

- `VISA_API_URL` (Opsiyonel): Kullanılacak API adresi. (Varsayılan: `https://api.visasbot.com/api/visa/list`)
- `MAX_RETRIES` (Opsiyonel): API hatalarında tekrar deneme sayısı (Varsayılan: 3).
- `RETRY_DELAY_BASE` (Opsiyonel): API hataları arasında bekleme süresi (ms) (Varsayılan: 1000).
- `MAX_CACHE_SIZE` (Opsiyonel): Önbellekteki maksimum randevu ID'si sayısı (Varsayılan: 1000).
- `CACHE_CLEANUP_INTERVAL` (Opsiyonel): Önbellek boyut kontrolü ve temizleme sıklığı (ms) (Varsayılan: 86400000 - 24 saat).
- `DEBUG` (Opsiyonel): Detaylı log kayıtları için hata ayıklama modu (`true`/`false`) (Varsayılan: `false`).

## 📱 Bildirim Örneği

Bot, filtrelerinize uyan ve durumu `open` veya `waitlist_open` olan bir randevu bulduğunda, önbellekte yoksa `src/services/telegram.ts` içindeki `formatMessage` fonksiyonuna göre Telegram'a şu formatta bir mesaj gönderir (emojiler ve bazı alanlar duruma göre değişebilir):

```
*✅ YENİ RANDEVU DURUMU! *

🏢 *Merkez:* Netherlands Visa Application Centre - Ankara
🌍 *Ülke/Misyon:* TUR -> NLD
🛂 *Kategori:* KISA DONEM VIZE / SHORT TERM VISA
📄 *Tip:* TURIZM VIZE BASVURUSU / TOURISM VISA APPLICATION
🚦 *Durum:* ✅ open
🗓️ *Son Müsait Tarih:* 22/07/2025

📊 *Takip Sayısı:* 6

⏰ *Son Kontrol:* 31 May 2025 12:02:56
```

(Not: Emoji ve format, randevu durumuna göre değişebilir: ✅ `open`, ⏳ `waitlist_open`)

## 🤔 Sık Sorulan Sorular

1.  **Bot çalışıyor mu?**

    - Konsolda `Vize randevu kontrolü başlatıldı...` mesajını görmelisiniz.
    - `DEBUG=true` yaparak `.env` dosyasında hata ayıklama modunu açın. Konsolda `Geçerli randevu bulundu...` veya `Skipping appointment...` gibi daha detaylı loglar görmelisiniz.

2.  **Telegram bildirimleri gelmiyor**

    - `.env` dosyasındaki `TELEGRAM_BOT_TOKEN` doğru mu kontrol edin.
    - `.env` dosyasındaki `TELEGRAM_CHAT_ID` doğru mu ve başında `-` işareti var mı kontrol edin.
    - Botu Telegram kanalınıza/grubunuza ekleyip **yönetici yetkisi** verdiğinizden emin olun.
    - `DEBUG=true` yapıp konsolda `Yeni randevu bildirimi gönderiliyor...` ve `Bildirim başarıyla gönderildi...` loglarını arayın. Hata varsa loglarda görünmelidir.

3.  **Belirli bir şehir/ülke/vize tipi için randevuları nasıl takip ederim?**

    - `.env` dosyasında `CITIES`, `MISSION_COUNTRY` ve `VISA_SUBCATEGORIES` değerlerini istediğiniz kriterlere göre (virgülle ayırarak) düzenleyin. Açıklamalar için `.env` örneğine bakın.
    - `MISSION_COUNTRY` için API'deki `mission_code` değerlerini (örn: `nld`, `fra`, `deu`) kullanın.
    - `VISA_SUBCATEGORIES` için API'deki `visa_type` içinde geçen kelimeleri kullanın.

4.  **Rate limit hatası alıyorum**

    - Telegram çok sık mesaj gönderildiği için botu geçici olarak engellemiş olabilir.
    - `.env` dosyasında `TELEGRAM_RATE_LIMIT_MINUTES` değerini artırarak dakikada gönderilecek mesaj sayısını azaltabilirsiniz (aslında bu ayar `config.telegram.rateLimit` olarak koda yansır ve Telegram servisi bu değeri doğrudan kullanır, bu nedenle kontroller arası süreyi etkiler).
    - `.env` dosyasında `CHECK_INTERVAL` değerini değiştirerek kontroller arasındaki süreyi artırabilirsiniz (örn: `*/10 * * * *` 10 dakikada bir).

5.  **API URL'si değişirse ne yapmalıyım?**
    - Mecburen yeni update beklemeniz gerekecek.

## 🚨 Hata Bildirimi

Bir hata bulduysanız veya öneriniz varsa, lütfen GitHub üzerinden [issue açın](https://github.com/byigitt/visa-checker/issues).

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakın.
