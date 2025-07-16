'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Users, Luggage, Plane, MapPin, Star, Check, CheckCircle,
  Download, Mail, Phone, ArrowRight, ArrowLeft, Sparkles, Shield, Car,
  Navigation, QrCode, CreditCard, Gift, AlertCircle, Wallet, Building2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Service imports
import { EmailService } from '../../lib/services/emailService';
import { AuthService } from '../../lib/services/authService';
import { realTimeReservationService } from '../../lib/services/realTimeService';
import { vehicleService } from '../../lib/services/vehicleService';
import { serviceService } from '../../lib/services/serviceService';

// UI Component imports
import HybridAddressInput from '../../components/ui/HybridAddressInput';
import HybridRouteDisplay from '../../components/ui/HybridRouteDisplay';
import { GoogleMapsService } from '../../lib/services/googleMapsService';
import ErrorBoundary, { GoogleMapsErrorBoundary } from '../../components/common/ErrorBoundary';

// Import existing types
import { Vehicle as BaseVehicle, Service as BaseService } from '../../lib/types';

// Type definitions for the new reservation system
interface RouteInfo {
  distance: number;
  duration: number;
  distanceText: string;
  durationText: string;
}

interface Vehicle extends BaseVehicle {
  gradient?: string; // Optional since not all vehicles may have this
}

interface Service extends BaseService {
  icon?: any;
  gradient?: string;
}

interface ReservationData {
  // Step 1: Route Selection
  direction: 'airport-to-hotel' | 'hotel-to-airport';
  hotelLocation: string;
  date: string;
  time: string;
  passengers: number;
  baggage: number;
  from: string;
  to: string;
  distance: number;
  estimatedDuration: string;
  hotelPlace?: google.maps.places.Place;
  
  // Step 2: Vehicle & Price Selection
  vehicle?: Vehicle;
  selectedServices: string[];
  basePrice: number;
  servicesPrice: number;
  totalPrice: number;
  
  // Step 3: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  flightNumber?: string;
  specialRequests?: string;
  
  // Step 4: Payment
  paymentMethod: 'cash' | 'bank-transfer' | 'credit-card';
  
  // Internal fields
  id?: string;
  customerId?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: string;
  customerCredentials?: {
    email: string;
    tempPassword: string;
  };
}

interface PaymentSettings {
  creditCardActive: boolean;
  bankTransferActive: boolean;
  cashActive: boolean;
  bankDetails?: {
    bankName: string;
    accountHolder: string;
    iban: string;
    accountNumber: string;
    swiftCode?: string;
  };
}

// Main Reservation Page Component
export default function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<Partial<ReservationData>>({});
  const [qrCode, setQrCode] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMountedRef = useRef(true);

  const stepNames = ['Rota', 'Araç', 'Bilgiler', 'Ödeme', 'Onay'];

  const safeSetCurrentStep = useCallback(async (newStep: number) => {
    if (isTransitioning || !isMountedRef.current) return;
    
    setIsTransitioning(true);
    await GoogleMapsService.safeStepTransitionCleanup();
    setCurrentStep(newStep);
    
    setTimeout(() => {
      if (isMountedRef.current) setIsTransitioning(false);
    }, 400); 
  }, [isTransitioning]);

  useEffect(() => {
    isMountedRef.current = true;
    loadInitialData();
    return () => { isMountedRef.current = false; };
  }, []);

  const loadInitialData = async () => {
    setLoadingVehicles(true);
    setLoadingServices(true);
    try {
      const [vehiclesData, servicesData] = await Promise.all([
        vehicleService.getAll(),
        serviceService.getProcessedServices()
      ]);

      if(isMountedRef.current) {
          setVehicles(vehiclesData.filter((v:any) => v.isActive !== false));
          setServices(servicesData);
      }
    } catch (error) {
      toast.error("Veriler yüklenemedi.");
    } finally {
      if(isMountedRef.current) {
          setLoadingVehicles(false);
          setLoadingServices(false);
      }
    }
  };

  const handleRouteNext = (data: any) => {
    setReservationData(prev => ({ ...prev, ...data }));
    safeSetCurrentStep(2);
  };

  const handleVehicleNext = (data: any) => {
    setReservationData(prev => ({ ...prev, ...data }));
    safeSetCurrentStep(3);
  };

  const handleCustomerNext = (data: any) => {
    setReservationData(prev => ({ ...prev, ...data }));
    safeSetCurrentStep(4);
  };

  const handlePaymentNext = async (paymentData: any) => {
    setIsTransitioning(true);
    const finalData = { ...reservationData, ...paymentData, status: 'pending' as const, createdAt: new Date().toISOString() };
    
    try {
        // Step 1: Create automatic user account
        let customerCredentials = null;
        try {
            const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
            const { AuthService } = await import('../../lib/services/authService');
            
            const user = await AuthService.createAccountWithEmail(
                finalData.email!,
                tempPassword,
                `${finalData.firstName} ${finalData.lastName}`
            );
            
            if (user) {
                customerCredentials = {
                    email: finalData.email!,
                    tempPassword: tempPassword
                };
                finalData.customerId = user.uid;
                console.log('✅ Customer account created successfully:', user.uid);
            }
        } catch (authError) {
            console.error('❌ Customer account creation failed:', authError);
            toast.error('Hesap oluşturulamadı, ancak rezervasyonunuz kaydedildi.');
        }

        // Step 2: Save reservation to database
        const reservationId = await realTimeReservationService.create(finalData);
        finalData.id = reservationId;

        // Step 3: Generate QR code
        const qrCodeUrl = await EmailService.generateQRCode(finalData);
        
        // Step 4: Send confirmation email with QR code
        await EmailService.sendConfirmationEmail(finalData, qrCodeUrl);
        
        // Step 5: Update final data with customer credentials and proceed
        setQrCode(qrCodeUrl);
        if (customerCredentials) {
            finalData.customerCredentials = customerCredentials;
        }
        setReservationData(finalData);
        
        toast.success('🎉 Rezervasyonunuz başarıyla oluşturuldu!');
        if (customerCredentials) {
            toast.success('✨ Müşteri hesabınız otomatik olarak oluşturuldu!');
        }
        
        safeSetCurrentStep(5);

    } catch (error) {
        console.error('Rezervasyon veya e-posta hatası:', error);
        toast.error('❌ Rezervasyon oluşturulurken bir hata oluştu.');
        setIsTransitioning(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        <header className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">SBS TRAVEL</h1>
                  <p className="text-xs text-blue-200">Premium Transfer</p>
                </div>
              </Link>
              <Link href="/" className="text-white/80 hover:text-white transition-colors flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Ana Sayfa</span>
              </Link>
            </div>
          </div>
        </header>
        <div className="relative z-10 py-12">
          <div className="text-center mb-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-4">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-white/90 text-sm">Premium Rezervasyon</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">Transfer Rezervasyonu</span>
              </h1>
              <p className="text-white/70 text-lg">5 kolay adımda lüks yolculuğunuzu planlayın</p>
            </motion.div>
          </div>
          <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {Array.from({ length: 5 }, (_, index) => (
                    <React.Fragment key={index}>
                      <div className="flex flex-col items-center">
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: currentStep >= index + 1 ? 1 : 0.8 }} className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm relative ${currentStep >= index + 1 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-white/20 text-white/60'}`}>
                          {currentStep > index + 1 ? (<CheckCircle className="h-6 w-6" />) : (index + 1)}
                          {currentStep >= index + 1 && (<div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 animate-pulse"></div>)}
                        </motion.div>
                        <span className={`mt-3 text-sm font-medium ${currentStep >= index + 1 ? 'text-white' : 'text-white/60'}`}>{stepNames[index]}</span>
                      </div>
                      {index < 4 && (
                        <div className="flex-1 h-1 mx-4 bg-white/20 rounded-full overflow-hidden">
                          <motion.div initial={{ width: '0%' }} animate={{ width: currentStep > index + 1 ? '100%' : '0%' }} className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" transition={{ duration: 0.5 }} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              
              <GoogleMapsErrorBoundary>
                <AnimatePresence mode="wait" initial={false}>
                  <div className="min-h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white">Rezervasyon sistemi hazırlanıyor...</p>
                      <p className="text-white/60 text-sm mt-2">5 adımlı yeni rezervasyon akışı yakında!</p>
                    </div>
                  </div>
                </AnimatePresence>
              </GoogleMapsErrorBoundary>
              
              {isTransitioning && currentStep !== 5 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-3xl">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="text-white font-medium">Adım geçişi...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}