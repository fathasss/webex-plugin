# Webex Embedded App Plugin

Bu proje, Webex platformu için geliştirilmiş Angular 17 tabanlı bir Embedded (Gömülü) Uygulama eklentisidir. Uygulama, geliştirme sürecini hızlandırmak için özel bir **Mock (Sahte) Mimari** ile donatılmıştır.

## 🚀 Başlangıç

Projeyi bilgisayarınıza indirdikten sonra kütüphaneleri kurmak için:
```bash
npm install
```

---

## 🛠️ Mimari: Mock vs Production (Real)

Uygulama, Webex ortamını simüle edebilmek için "Dependency Injection" üzerine kurulu iki farklı servis kullanır:
1. `WebexMockService`: Geliştirme (Development) ortamında çalışır.
2. `RealWebexService`: Canlı (Production) ortamda çalışır ve gerçek `window.Webex` SDK'sına bağlanır.

### Geliştirme Modu (Development - MOCK)
Webex hesabına veya Emulator'e **ihtiyaç duymadan** doğrudan tarayıcınızda test yapmak için:
```bash
ng serve
```
Uygulama `http://localhost:4200` adresinde açılır. Sağ alt köşede yer alan **Webex Mock Environment Debug Paneli** üzerinden;
- "Start Meeting" / "End Meeting" butonlarıyla toplantı durumunu değiştirebilir,
- "Theme: Light / Dark" butonlarıyla tema geçişlerini simüle edebilirsiniz.

Bu moddayken uygulama `environment.ts` (webexMode: 'mock') dosyasını okur.

### Canlı Mod (Production - REAL)
Uygulamanın gerçek Webex uygulamasının içinde çalışacak şekilde derlenmesi için:
```bash
npm run build
```
*(veya test amaçlı canlı derlemeyi local'de görmek için: `ng serve --configuration production`)*

Bu komut çalıştırıldığında Angular otomatik olarak `environment.ts` dosyasını `environment.prod.ts` (webexMode: 'real') ile değiştirir. 
- Mock (Sahte) servis kodları projeden tamamen temizlenir.
- Debug Paneli arayüzden kaldırılır.
- Uygulama doğrudan `window.Webex` SDK'sı ile çalışmaya başlar.

Oluşan `dist/webex-app` dosyalarını (Firebase, Vercel vb.) bir sunucuya yükleyerek Webex Developer Portal'da **Start Page URL** olarak verebilirsiniz.

---

## 🏗️ Proje Yapısı

- `src/app/core/webex/`: Abstraction katmanı, Modeller, Mock ve Real servislerin bulunduğu yer.
- `src/app/components/webex-debug-panel/`: Geliştirici test paneli. (Sadece development ortamında derlenir).
- `src/environments/`: Mod geçişlerini belirleyen `environment.ts` ve `environment.prod.ts` dosyaları.

---

## 🌐 Webex'te Uygulamayı Açmak ve Kullanmak

Derlenen production kodlarınızı (dist klasörü) gerçek Webex Masaüstü uygulamasında kullanmak için:

### 1. Uygulamayı İnternete Açın
Oluşan `dist/webex-app` dosyalarınızı güvenli (HTTPS) bir sunucuya yükleyin (Örn: Vercel, Netlify, Firebase veya kendi IIS/Nginx sunucunuz). Veya local testler için geçici olarak **ngrok** (`ngrok http 4200`) kullanabilirsiniz.
*(Not: Ngrok kullanırken `environment.ts` dosyanızdaki ayarı geçici olarak `webexMode: 'real'` yapmayı unutmayın).*

### 2. Uygulamayı Webex Developer Portal'a Kaydedin
1. [developer.webex.com](https://developer.webex.com/)'a giriş yapın.
2. Profilinize tıklayıp **"My Webex Apps"** -> **"Create a New App"** -> **"Embedded App"** seçeneğine gidin.
3. Formu doldurun ve **"Start Page URL"** kısmına uygulamanızı yüklediğiniz HTTPS linkini yapıştırın.
4. Uygulamanızın çalışacağı yerleri (Meeting, Messaging) seçip **"Add App"** butonuna basın.

### 3. Gerçek Webex'te Kullanın
1. Bilgisayarınızdaki gerçek **Webex Masaüstü** uygulamasını açın.
2. Yeni bir toplantı (Meeting) veya Space başlatın.
3. Sağ alttaki (veya üstteki) **"Apps"** butonuna tıklayın.
4. **"In Development"** sekmesinde uygulamanızı bulun ve üzerine tıklayın. Eklentiniz yan panelde kusursuzca açılacaktır!

---

## 📡 Webhook İletişimi
Uygulama, çalıştırıldığı anda (`ngOnInit`) Webex kullanıcısının bilgilerini ve toplantı bağlamını çeker, ardından arka plandaki C# / .NET (veya farklı bir dil) ile yazılmış webhook API'sine POST isteği gönderir. 
> İlgili ayarlar `app.component.ts` içerisindeki `notifyBackendService` fonksiyonunda yapılmaktadır.
