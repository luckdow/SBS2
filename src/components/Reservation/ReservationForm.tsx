import React, { useState } from 'react';
import { StepIndicator } from './StepIndicator';
import { RouteStep } from './RouteStep';
import { VehicleStep } from './VehicleStep';
import { CustomerInfoStep } from './CustomerInfoStep';
import { ConfirmationStep } from './ConfirmationStep';
import { Card } from '../ui/Card';
import { ReservationService } from '../../lib/services/reservationService';
import toast from 'react-hot-toast';

export const ReservationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<any>({});
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const stepNames = ['Rota & Detay', 'Araç & Fiyat', 'Bilgiler', 'Onay'];

  const handleRouteNext = (routeData: any) => {
    setReservationData(prev => ({ ...prev, ...routeData }));
    setCurrentStep(2);
  };

  const handleVehicleNext = (vehicleData: any) => {
    setReservationData(prev => ({ ...prev, ...vehicleData }));
    setCurrentStep(3);
  };

  const handleCustomerNext = async (customerData: any) => {
    setLoading(true);
    try {
      const finalReservationData = { ...reservationData, ...customerData };
      
      // Create reservation in Firebase
      const reservationService = ReservationService.getInstance();
      const reservationId = await reservationService.createReservation({
        customerId: 'temp-customer-id', // Would be actual user ID
        vehicleId: finalReservationData.vehicle.id,
        from: finalReservationData.from,
        to: finalReservationData.to,
        fromCoords: { lat: 36.8969, lng: 30.7133 }, // Mock coordinates
        toCoords: { lat: 36.8969, lng: 30.7133 },
        distance: finalReservationData.distance,
        duration: 45, // Mock duration
        date: new Date(finalReservationData.date),
        time: finalReservationData.time,
        passengers: finalReservationData.passengers,
        baggage: finalReservationData.baggage,
        flightNumber: finalReservationData.flightNumber,
        selectedServices: finalReservationData.selectedServices || [],
        basePrice: finalReservationData.basePrice,
        servicesPrice: finalReservationData.servicesPrice,
        totalPrice: finalReservationData.totalPrice,
        status: 'pending',
      });

      // Get the created reservation to get the QR code
      const createdReservation = await reservationService.getReservation(reservationId);
      if (createdReservation) {
        setQrCode(createdReservation.qrCode);
        setReservationData(finalReservationData);
        setCurrentStep(4);
        toast.success('Rezervasyonunuz başarıyla oluşturuldu!');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Rezervasyon oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8">
        <StepIndicator 
          currentStep={currentStep} 
          totalSteps={4} 
          stepNames={stepNames}
        />

        {currentStep === 1 && (
          <RouteStep onNext={handleRouteNext} />
        )}

        {currentStep === 2 && (
          <VehicleStep 
            routeData={reservationData}
            onNext={handleVehicleNext}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <CustomerInfoStep 
            onNext={handleCustomerNext}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <ConfirmationStep 
            reservationData={reservationData}
            qrCode={qrCode}
          />
        )}
      </Card>
    </div>
  );
};