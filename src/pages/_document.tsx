import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="SBS Travel - Antalya'da güvenli ve konforlu transfer hizmeti. Havalimanı transferleri, şehir içi ulaşım ve özel turlar." />
        <meta name="keywords" content="antalya transfer, havalimanı transfer, sbs travel, güvenli transfer, konforlu ulaşım" />
        <meta name="author" content="SBS Travel" />
        
        {/* Open Graph */}
        <meta property="og:title" content="SBS Travel - Güvenli Transfer Hizmeti" />
        <meta property="og:description" content="Antalya'da güvenli ve konforlu transfer hizmeti" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SBS Travel - Güvenli Transfer Hizmeti" />
        <meta name="twitter:description" content="Antalya'da güvenli ve konforlu transfer hizmeti" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        
        {/* Google Maps API */}
        <script 
          async 
          defer 
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}