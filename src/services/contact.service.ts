import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const CONTACT_COLLECTION = 'contact_messages';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<string> {
  try {
    const messageData = {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      createdAt: serverTimestamp(),
      status: 'new' as const,
    };

    const docRef = await addDoc(collection(db, CONTACT_COLLECTION), messageData);
    
    // إرسال إشعار بالبريد الإلكتروني (يمكن تفعيله لاحقاً عبر Cloud Functions)
    // يمكن استخدام EmailJS أو خدمة مشابهة للإرسال المباشر
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting contact message:', error);
    throw new Error('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
  }
}

// دالة لإرسال البريد باستخدام mailto (حل بديل بسيط)
export function sendEmailViaMailto(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): void {
  const recipient = 'tolzyofficial@gmail.com';
  const subject = encodeURIComponent(`رسالة من ${data.name}: ${data.subject}`);
  const body = encodeURIComponent(
    `الاسم: ${data.name}\n` +
    `البريد الإلكتروني: ${data.email}\n` +
    `الموضوع: ${data.subject}\n\n` +
    `الرسالة:\n${data.message}`
  );
  
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
}
