'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, ArrowLeft, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Service imports
import { EmailService } from '../../lib/services/emailService';
import { AuthService } from '../../lib/services/authService';
import { realTimeReservationService } from '../../lib/services/realTimeService';
import { GoogleMapsService } from '../../lib/services/googleMapsService';
import ErrorBoundary, { GoogleMapsErrorBoundary } from '../../components/common/ErrorBoundary';

// Component imports - New 5-step flow
import StepIndicator from './components/StepIndicator';
import Step1RouteSelection from './components/Step1RouteSelection';
import Step2VehicleSelection from './components/Step2VehicleSelection';
import Step3PersonalInfo from './components/Step3PersonalInfo';
import Step4Payment from './components/Step4Payment';
import Step5Confirmation from './components/Step5Confirmation';

// Type imports
import type { ReservationData } from './types/reservation';

/**
 * Modern 5-Step Reservation System
 * Completely rebuilt to eliminate DOM conflicts and provide seamless user experience
 */
export default function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<Partial<ReservationData>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMountedRef = useRef(true);

  const stepNames = ['Rota', 'Araç', 'Bilgiler', 'Ödeme', 'Onay'];

  // Safe step transition with Google Maps cleanup
  const safeSetCurrentStep = useCallback(async (newStep: number) => {
    if (isTransitioning || !isMountedRef.current) return;
    
    setIsTransitioning(true);
    
    // Clean up Google Maps components to prevent DOM conflicts
    try {
      await GoogleMapsService.safeStepTransitionCleanup();
    } catch (error) {
      console.warn('Google Maps cleanup warning:', error);
    }
    
    setCurrentStep(newStep);
    
    // Short delay for smooth transition
    setTimeout(() => {
      if (isMountedRef.current) setIsTransitioning(false);
    }, 300); 
  }, [isTransitioning]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { 
      isMountedRef.current = false; 
    };
  }, []);

  // Step navigation handlers
  const handleStepNext = (stepData: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...stepData }));
    safeSetCurrentStep(currentStep + 1);
  };

  const handleStepBack = () => {
    safeSetCurrentStep(currentStep - 1);
  };

  // Final step: Complete reservation with automatic membership
  const handleReservationComplete = async (paymentData: Partial<ReservationData>) => {
    setIsTransitioning(true);
    const finalData = { 
      ...reservationData, 
      ...paymentData, 
      status: 'pending' as const, 
      createdAt: new Date().toISOString() 
    };
    
    try {
      // Step 1: Create automatic user account
      let customerCredentials = null;
      try {
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
        
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
      finalData.qrCode = qrCodeUrl;
      
      // Step 4: Send confirmation email with QR code
      await EmailService.sendConfirmationEmail(finalData, qrCodeUrl);
      
      // Step 5: Update final data with customer credentials
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
      console.error('Rezervasyon hatası:', error);
      toast.error('❌ Rezervasyon oluşturulurken bir hata oluştu.');
      setIsTransitioning(false);
    }
  };

  // Render current step component
  const renderCurrentStep = () => {
    const commonProps = {
      data: reservationData,
      onNext: currentStep === 4 ? handleReservationComplete : handleStepNext,
      onBack: currentStep > 1 ? handleStepBack : undefined
    };

    switch (currentStep) {
      case 1:
        return <Step1RouteSelection {...commonProps} />;
      case 2:
        return <Step2VehicleSelection {...commonProps} />;
      case 3:
        return <Step3PersonalInfo {...commonProps} />;
      case 4:
        return <Step4Payment {...commonProps} />;
      case 5:
        return <Step5Confirmation data={reservationData} onNext={() => {}} />;
      default:
        return <Step1RouteSelection {...commonProps} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Header */}
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

        {/* Main Content */}
        <div className="relative z-10 py-12">
          {/* Page Title */}
          <div className="text-center mb-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-4">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-white/90 text-sm">Premium Rezervasyon</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Transfer Rezervasyonu
                </span>
              </h1>
              <p className="text-white/70 text-lg">5 kolay adımda lüks yolculuğunuzu planlayın</p>
            </motion.div>
          </div>

          {/* Reservation Container */}
          <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
              {/* Step Indicator */}
              <StepIndicator currentStep={currentStep} stepNames={stepNames} />
              
              {/* Step Content */}
              <GoogleMapsErrorBoundary>
                <div className="relative">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-[600px]"
                    >
                      {renderCurrentStep()}
                    </motion.div>
                  </AnimatePresence>

                  {/* Transition Overlay */}
                  {isTransitioning && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl"
                    >
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          <span className="text-white font-medium">İşleniyor...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </GoogleMapsErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}