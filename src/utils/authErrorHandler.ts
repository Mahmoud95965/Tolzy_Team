/**
 * Firebase Auth Error Handler
 * Converts Firebase error codes to user-friendly Arabic messages
 */

export interface FirebaseAuthError {
  code?: string;
  message?: string;
}

/**
 * Get user-friendly Arabic error message from Firebase error
 */
export const getAuthErrorMessage = (error: any): string => {
  const errorCode = error?.code || '';
  
  const firebaseErrorMessages: { [key: string]: string } = {
    // Authentication Errors
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'auth/user-not-found': 'لا يوجد حساب مسجل بهذا البريد الإلكتروني',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/email-already-in-use': 'هذا البريد الإلكتروني مسجل بالفعل',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/operation-not-allowed': 'هذه العملية غير مسموحة حالياً',
    'auth/too-many-requests': 'عدد محاولات كثير جداً، حاول لاحقاً',
    'auth/account-exists-with-different-credential': 'حساب موجود برقم تعريفي مختلف',
    'auth/network-request-failed': 'خطأ في الاتصال بالإنترنت، تحقق من الاتصال',
    'auth/internal-error': 'خطأ داخلي في الخادم، حاول مجدداً',
    'auth/popup-blocked': 'قم بتفعيل النوافذ المنبثقة في المتصفح',
    'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
    'auth/cancelled-popup-request': 'تم إلغاء عملية تسجيل الدخول',
    
    // Email OTP Errors
    'auth/email-verification-failed': 'فشل التحقق من البريد الإلكتروني',
    'auth/invalid-otp': 'رمز التحقق غير صحيح أو انتهت صلاحيته',
    'auth/otp-expired': 'انتهت صلاحية رمز التحقق',
    
    // Custom API Errors
    'INVALID_OTP': 'رمز التحقق غير صحيح',
    'OTP_EXPIRED': 'انتهت صلاحية رمز التحقق',
    'EMAIL_NOT_FOUND': 'البريد الإلكتروني غير موجود',
    'USER_NOT_FOUND': 'لم يتم العثور على المستخدم',
  };

  if (firebaseErrorMessages[errorCode]) {
    return firebaseErrorMessages[errorCode];
  }

  // Fallback to generic error message
  if (error?.message) {
    return error.message;
  }

  return 'حدث خطأ غير متوقع، يرجى المحاولة مجدداً';
};

/**
 * Log error with structured format for debugging
 */
export const logAuthError = (context: string, error: any) => {
  console.error(`❌ ${context}:`, {
    code: error?.code,
    message: error?.message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Format error for API response
 */
export const formatApiError = (error: any) => {
  return {
    error: getAuthErrorMessage(error),
    code: error?.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  };
};
