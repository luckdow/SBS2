// Email Service for QR Code and Confirmations
import QRCode from 'qrcode';

export class EmailService {
  static async generateQRCode(reservationData: any): Promise<string> {
    try {
      const qrData = JSON.stringify({
        reservationId: reservationData.id,
        customerId: reservationData.customerId,
        timestamp: Date.now(),
        verification: `SBS-${reservationData.id}-${Date.now()}`
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeUrl;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw error;
    }
  }

  static async sendConfirmationEmail(reservationData: any, qrCode: string): Promise<boolean> {
    try {
      // In production, integrate with email service (SendGrid, Mailgun, etc.)
      console.log('Sending confirmation email to:', reservationData.email);
      console.log('QR Code:', qrCode);
      
      // Mock email sending for demo
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  static generateEmailTemplate(reservationData: any, qrCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SBS TRAVEL - Rezervasyon Onayı</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">SBS TRAVEL</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Premium Transfer Hizmeti</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Rezervasyonunuz Onaylandı! 🎉</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-top: 0;">Rezervasyon Detayları</h3>
              <p><strong>Rezervasyon No:</strong> #${reservationData.id}</p>
              <p><strong>Nereden:</strong> ${reservationData.from}</p>
              <p><strong>Nereye:</strong> ${reservationData.to}</p>
              <p><strong>Tarih:</strong> ${reservationData.date}</p>
              <p><strong>Saat:</strong> ${reservationData.time}</p>
              <p><strong>Yolcu:</strong> ${reservationData.passengers} kişi</p>
              <p><strong>Toplam Tutar:</strong> ₺${reservationData.totalPrice}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #333;">QR Kodunuz</h3>
              <img src="${qrCode}" alt="QR Code" style="max-width: 200px; border: 2px solid #ddd; border-radius: 8px;">
              <p style="color: #666; font-size: 14px; margin-top: 10px;">Bu QR kodu şoförünüze gösterin</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <h4 style="color: #1976d2; margin-top: 0;">Önemli Bilgiler:</h4>
              <ul style="color: #333; margin: 0; padding-left: 20px;">
                <li>Şoförünüz size WhatsApp üzerinden iletişim kuracak</li>
                <li>Yolculuk zamanından 30 dakika önce arayacağız</li>
                <li>QR kodunuzu şoföre gösterdikten sonra yolculuk başlayacak</li>
                <li>Acil durumlar için: +90 532 123 4567</li>
              </ul>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              © 2024 SBS TRAVEL - Premium Transfer Hizmeti
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}