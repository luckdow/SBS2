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

`.env.local` dosyası oluşturun ve gerekli konfigürasyonları ekleyin:

```env
# Google Maps API Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here

# PayTR Configuration (Optional)
NEXT_PUBLIC_PAYTR_MERCHANT_ID=your_paytr_merchant_id
NEXT_PUBLIC_PAYTR_MERCHANT_KEY=your_paytr_merchant_key
NEXT_PUBLIC_PAYTR_MERCHANT_SALT=your_paytr_merchant_salt
```

#### Google Maps API Key Alma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut bir projeyi seçin
3. **APIs & Services** → **Library** bölümüne gidin
4. **Maps JavaScript API** ve **Places API** servislerini etkinleştirin
5. **APIs & Services** → **Credentials** bölümüne gidin
6. **Create Credentials** → **API Key** seçeneğini seçin
7. Oluşturulan API anahtarını `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` değişkenine ekleyin

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

### Vercel Deployment (Önerilen)

1. **Environment Variables** ekleyin:
   - Vercel Dashboard → Project Settings → Environment Variables
   - Aşağıdaki değişkenleri ekleyin:
     - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
     - Firebase değişkenleri (yukarıda belirtildiği gibi)
     - PayTR değişkenleri (isteğe bağlı)

2. **Build Settings**:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Node version: 18+

3. **Deploy** butonuna tıklayın

### Netlify Deployment

1. **Environment Variables** ekleyin:
   - Netlify Dashboard → Site Settings → Environment Variables
   - Yukarıdaki Google Maps ve Firebase değişkenlerini ekleyin

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