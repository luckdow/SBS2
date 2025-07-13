# SBS TRAVEL - Premium Transfer Platform

Ultra modern transfer rezervasyon ve yönetim sistemi.

## 🚀 Özellikler

- **Modern UI/UX** - Glassmorphism tasarım
- **Responsive Design** - Tüm cihazlarda mükemmel
- **Real-time Updates** - Canlı veri güncellemeleri
- **Admin Panel** - Tam yönetim sistemi
- **Driver Panel** - Şoför görev yönetimi
- **Customer Panel** - Müşteri deneyimi

## 🛠️ Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Environment Variables Ayarla

`.env.local` dosyası oluşturun ve Firebase konfigürasyonunu ekleyin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

### 3. Development Server Başlat
```bash
npm run dev
```

## 📱 Sayfalar

- **Ana Sayfa** - `/` - Premium landing page
- **Rezervasyon** - `/reservation` - 4 adımlı rezervasyon sistemi
- **Admin Panel** - `/admin` - Yönetim dashboard'u
- **Şoför Panel** - `/driver` - Şoför görev yönetimi
- **Müşteri Panel** - `/customer` - Müşteri deneyimi

## 🔧 Teknolojiler

- **Next.js 14** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animasyonlar
- **Firebase** - Backend services
- **Lucide React** - Modern iconlar

## 🚀 Deployment

### Netlify Deployment

1. **Environment Variables** ekleyin:
   - Netlify Dashboard → Site Settings → Environment Variables
   - Yukarıdaki Firebase değişkenlerini ekleyin

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: 18+

3. **Deploy** butonuna tıklayın

### Manual Build
```bash
npm run build
```

## 🌱 Firebase Seed Data

Firebase'e test verileri yüklemek için:

1. `/admin/seed` sayfasına gidin
2. "Tüm Verileri Yükle" butonuna tıklayın
3. Test verileri otomatik yüklenecek

## 📝 Notlar

- Firebase konfigürasyonu environment variables ile güvenli hale getirilmiştir
- Mock data sistemi Firebase olmadan da çalışmayı sağlar
- Responsive tasarım tüm cihazlarda test edilmiştir
- Static export Netlify deployment için optimize edilmiştir

## 🎨 Tasarım

- **Glassmorphism** - Modern cam efekti
- **Gradient Backgrounds** - Renkli arka planlar
- **Smooth Animations** - Akıcı geçişler
- **Dark Theme** - Modern koyu tema