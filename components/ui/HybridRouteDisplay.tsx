'use client'

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { GoogleMapsService } from '../../lib/services/googleMapsService';

// Prop tiplerini tanımlıyoruz
interface HybridRouteDisplayProps {
  origin: string;
  destination: string;
  originPlace?: google.maps.places.PlaceResult;
  destinationPlace?: google.maps.places.PlaceResult;
  onRouteCalculated?: (result: {
    distance: number;
    duration: number;
    distanceText: string;
    durationText: string;
  }) => void;
}

export default function HybridRouteDisplay({
  origin,
  destination,
  originPlace,
  destinationPlace,
  onRouteCalculated,
}: HybridRouteDisplayProps) {
  // Haritanın render edileceği div elementine erişim için ref
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Harita ve rota çizici nesnelerini tekrar tekrar oluşturmamak için ref'lerde saklıyoruz
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  // Bileşenin durumunu yönetmek için state'ler
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Başlangıç veya bitiş noktası yoksa işlemi başlatma
    if (!origin || !destination) return;
    
    // Haritayı ve rotayı çizecek olan ana fonksiyon
    const initAndDrawRoute = async () => {
      // Önceki denemeden hata kaldıysa temizle ve yükleniyor durumuna geç
      setStatus('loading');
      setErrorMessage('');

      // mapRef.current'in var olduğundan emin ol
      if (!mapRef.current) {
        setStatus('error');
        setErrorMessage('Harita konteyneri bulunamadı.');
        return;
      }

      try {
        // Google Maps API'sinin yüklendiğinden emin ol
        const google = await GoogleMapsService.loadGoogleMaps();

        // Haritayı sadece bir kere oluştur
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            zoom: 10,
            center: { lat: 36.8969, lng: 30.7133 }, // Antalya varsayılan merkez
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
        }

        // Rota çiziciyi sadece bir kere oluştur ve haritaya bağla
        if (!directionsRendererRef.current) {
          directionsRendererRef.current = new google.maps.DirectionsRenderer({
            polylineOptions: { strokeColor: '#3B82F6', strokeWeight: 6, strokeOpacity: 0.9 }
          });
          directionsRendererRef.current.setMap(mapInstanceRef.current);
        }

        // Rota hesaplama isteğini gönder
        const result = await GoogleMapsService.getDirections(
          originPlace?.geometry?.location || origin,
          destinationPlace?.geometry?.location || destination
        );
        
        // Rota sonucunu haritaya çizdir
        directionsRendererRef.current.setDirections(result);

        // Rota bilgilerini (mesafe, süre) kontrol et ve yukarıya gönder
        const leg = result.routes[0]?.legs[0];
        if (leg?.distance && leg?.duration) {
          onRouteCalculated?.({
            distance: leg.distance.value,
            duration: leg.duration.value,
            distanceText: leg.distance.text,
            durationText: leg.duration.text,
          });
          setStatus('success');
        } else {
          throw new Error("Google'dan gelen rota bilgileri eksik.");
        }

      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Bilinmeyen bir harita hatası oluştu.';
        setErrorMessage(msg);
        setStatus('error');
        console.error('Rota Çizim Hatası:', msg);
      }
    };

    initAndDrawRoute();

  }, [origin, destination, originPlace, destinationPlace, onRouteCalculated]); // Bu effect, sadece bu değerler değiştiğinde tekrar çalışır

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
      <div ref={mapRef} className="relative h-64 bg-slate-800/50 rounded-xl flex items-center justify-center overflow-hidden">
        {/* Duruma göre gösterilecek arayüzler */}
        {status === 'loading' && (
          <div className="text-center text-white/80">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Rota hesaplanıyor...</p>
          </div>
        )}
        {status === 'error' && (
           <div className="text-center text-red-300 p-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Harita gösterilemedi.</p>
            <p className="text-xs mt-1">{errorMessage}</p>
          </div>
        )}
        {/* Başarılı olduğunda harita görüneceği için burası boş kalır */}
      </div>
    </div>
  );
}
