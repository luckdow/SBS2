// PayTR Payment Gateway Integration Service
export interface PayTRConfig {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  testMode: boolean;
  successUrl: string;
  failUrl: string;
}

export interface PaymentRequest {
  amount: number;
  orderId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  token?: string;
  iframe?: string;
  error?: string;
  redirectUrl?: string;
}

export class PayTRService {
  private static config: PayTRConfig | null = null;

  // Initialize PayTR configuration
  static initialize(config: PayTRConfig) {
    this.config = config;
  }

  // Check if PayTR is configured and enabled
  static isConfigured(): boolean {
    return this.config !== null && 
           this.config.merchantId !== '' && 
           this.config.merchantKey !== '' && 
           this.config.merchantSalt !== '';
  }

  // Generate PayTR payment token
  static async createPaymentToken(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.isConfigured() || !this.config) {
      return {
        success: false,
        error: 'PayTR yapılandırması bulunamadı'
      };
    }

    try {
      // PayTR API endpoint
      const apiUrl = this.config.testMode 
        ? 'https://www.paytr.com/odeme/api/get-token'
        : 'https://www.paytr.com/odeme/api/get-token';

      // Prepare PayTR request data
      const paytrData = {
        merchant_id: this.config.merchantId,
        user_ip: await this.getUserIP(),
        merchant_oid: request.orderId,
        email: request.customerEmail,
        payment_amount: (Math.round(request.amount * 100)).toString(), // Convert to kuruş and string
        paytr_token: this.generateToken(request),
        user_basket: this.encodeBasket(request),
        debug_on: this.config.testMode ? '1' : '0',
        no_installment: '0',
        max_installment: '0',
        user_name: request.customerName,
        user_address: 'Antalya, Türkiye',
        user_phone: request.customerPhone,
        merchant_ok_url: this.config.successUrl,
        merchant_fail_url: this.config.failUrl,
        timeout_limit: '30',
        currency: 'TL',
        test_mode: this.config.testMode ? '1' : '0'
      };

      // Make request to PayTR API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(paytrData)
      });

      const result = await response.json();

      if (result.status === 'success') {
        return {
          success: true,
          token: result.token,
          redirectUrl: `https://www.paytr.com/odeme/guvenlik/${result.token}`
        };
      } else {
        return {
          success: false,
          error: result.reason || 'PayTR ödeme token oluşturulamadı'
        };
      }
    } catch (error) {
      console.error('PayTR API Error:', error);
      return {
        success: false,
        error: 'PayTR servisine bağlanılamadı'
      };
    }
  }

  // Generate PayTR security token
  private static generateToken(request: PaymentRequest): string {
    if (!this.config) return '';

    const hashString = [
      this.config.merchantId,
      request.orderId,
      Math.round(request.amount * 100),
      'TL',
      request.customerEmail,
      this.config.merchantSalt
    ].join('');

    // In a real implementation, you would use crypto.createHash('sha256')
    // For demo purposes, we'll return a mock token
    return this.mockHash(hashString);
  }

  // Generate user basket for PayTR
  private static encodeBasket(request: PaymentRequest): string {
    const basket = [
      ['Transfer Hizmeti', request.amount.toFixed(2), 1]
    ];
    
    // In real implementation, use base64 encoding
    return btoa(JSON.stringify(basket));
  }

  // Get user IP (mock implementation)
  private static async getUserIP(): Promise<string> {
    try {
      // In production, you might want to get the real IP
      return '127.0.0.1';
    } catch {
      return '127.0.0.1';
    }
  }

  // Mock hash function for demo (use real crypto in production)
  private static mockHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Verify PayTR callback
  static verifyCallback(data: any): boolean {
    if (!this.isConfigured() || !this.config) {
      return false;
    }

    try {
      const expectedHash = this.mockHash([
        data.merchant_oid,
        this.config.merchantSalt,
        data.status,
        data.total_amount
      ].join(''));

      return expectedHash === data.hash;
    } catch (error) {
      console.error('PayTR callback verification error:', error);
      return false;
    }
  }

  // Get current configuration
  static getConfig(): PayTRConfig | null {
    return this.config;
  }

  // Test PayTR connection
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'PayTR yapılandırması eksik'
      };
    }

    try {
      // Test with a minimal request
      const testRequest: PaymentRequest = {
        amount: 1,
        orderId: 'TEST' + Date.now(),
        customerEmail: 'test@test.com',
        customerName: 'Test User',
        customerPhone: '+905321234567',
        description: 'Test payment'
      };

      const result = await this.createPaymentToken(testRequest);
      
      return {
        success: result.success,
        message: result.success ? 'PayTR bağlantısı başarılı' : result.error || 'Bağlantı hatası'
      };
    } catch (error) {
      return {
        success: false,
        message: 'PayTR test bağlantısı başarısız'
      };
    }
  }
}