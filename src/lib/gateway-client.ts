/**
 * Gateway Client Integration
 * هذا الملف مسؤول عن التخاطب مع البوابة (https://gateway.tolzy.me) 
 * وتحديد خطة المستخدم بدقة (مثل Free, Pro, Ultra).
 */

export class GatewayClient {
  private baseUrl: string;
  private projectKey: string;
  private projectSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.tolzy.me';
    // مفاتيح الأمان يجب وضعها في ملف .env في الباك إند
    this.projectKey = process.env.GATEWAY_PROJECT_KEY || ''; 
    this.projectSecret = process.env.GATEWAY_PROJECT_SECRET || '';
  }

  /**
   * خطوة 1: استئذان البوابة لفتح اتصال آمن (جلب Access Token)
   */
  private async getAccessToken(): Promise<string> {
    // توفير الطلبات: إذا كان التوكن الحالي ساري المفعول، نستخدمه
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/integration/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-project-key': this.projectKey,
        },
        body: JSON.stringify({ projectSecret: this.projectSecret }),
      });

      if (!response.ok) {
        throw new Error('فشل المصادقة مع البوابة');
      }

      const data = await response.json();
      this.accessToken = data.token; // التوكن
      this.tokenExpiry = Date.now() + (data.expiresIn * 1000) - 5000; // مساحة أمان 5 ثوانِ
      return data.token;
    } catch (error) {
      console.error('Gateway Auth Error:', error);
      throw error;
    }
  }

  /**
   * خطوة 2: جلب صلاحيات المستخدم واستخراج "الخطة" (Entitlements)
   */
  public async getEntitlementsForUser(userId: string) {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/api/integration/entitlements?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('لا يمكن جلب بيانات الخطة للمستخدم من البوابة');
      }

      const data = await response.json();
      
      // من المتوقع أن ترد البوابة بشيء مثل: { plan: 'pro', features: [...], active: true }
      return data;
      
    } catch (error) {
      console.error('Failed to get user entitlements from Gateway:', error);
      // كإجراء أمني وقائي، إذا فشل الاتصال نعتبر المستخدم على الخطة المجانية 🎁
      return { plan: 'free' };
    }
  }
}

// تصدير دالة جاهزة للاستخدام في المشروع
export const gatewayClient = new GatewayClient();
