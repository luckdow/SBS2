import React from 'react';
import { Header } from '../components/Layout/Header';
import { ReservationForm } from '../components/Reservation/ReservationForm';

const ReservationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transfer Rezervasyonu</h1>
          <p className="text-gray-600">4 kolay adımda rezervasyonunuzu tamamlayın</p>
        </div>
        <ReservationForm />
      </div>
    </div>
  );
};

export default ReservationPage;