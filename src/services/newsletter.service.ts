import { supabase } from '../config/supabaseClient';

export interface SubscribeResponse {
  success: boolean;
  message: string;
  error?: any;
}

export const subscribeToNewsletter = async (email: string, source: string = 'website'): Promise<SubscribeResponse> => {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'الرجاء إدخال بريد إلكتروني صحيح' };
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, source }]);

    if (error) {
      // Handle unique constraint violation (already subscribed)
      if (error.code === '23505') {
        return { success: true, message: 'شكراً! أنت مشترك بالفعل في قائمتنا البريدية.' };
      }
      console.error('Newsletter subscription error:', error);
      return { success: false, message: 'حدث خطأ أثناء الاشتراك. حاول مرة أخرى لاحقاً.', error };
    }

    return { success: true, message: 'تم الاشتراك بنجاح! شكراً لانضمامك إلينا.' };
  } catch (err) {
    console.error('Unexpected error during subscription:', err);
    return { success: false, message: 'حدث خطأ غير متوقع.', error: err };
  }
};
