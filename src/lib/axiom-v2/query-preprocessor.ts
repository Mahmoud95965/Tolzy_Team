/**
 * src/lib/axiom-v2/query-preprocessor.ts
 * تجهيز وتنظيف وتوسيع نص الاستعلام لتحقيق أقصى دقة في البحث المتجهي الدلالي
 */

// الكلمات الشائعة وعبارات الطلب التي تشوش المتجه الدلالي
const STOP_WORDS = new Set([
  'اريد', 'ابحث', 'عايز', 'محتاج', 'هل', 'ممكن', 'اقترح', 'افضل', 'أفضل', 'احسن', 
  'احتاج', 'لو سمحت', 'من فضلك', 'اداة', 'أداة', 'ادوات', 'أدوات', 'برنامج', 'برامج', 
  'تطبيق', 'تطبيقات', 'عن', 'في', 'من', 'الى', 'إلى', 'على', 'مع', 'هذا', 'هذه', 
  'ماذا', 'كيف', 'اين', 'متى', 'لماذا', 'show', 'me', 'the', 'best', 'tool', 'for', 
  'find', 'search', 'give', 'want', 'need', 'can', 'you', 'please'
]);

/**
 * تنظيف الحركات، التطويل، وتوحيد الحروف في اللغة العربية
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';

  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // إزالة التشكيل والتنوين
    .replace(/ـ+/g, '')                   // إزالة التطويل (الكشيدة)
    .replace(/[إأآا]/g, 'ا')               // توحيد الألف
    .replace(/ة/g, 'ه')                   // توحيد التاء المربوطة والهاء
    .replace(/ى/g, 'ي');                  // توحيد الياء والألف المقصورة
}

/**
 * تجهيز وتحسين نص الاستعلام قبل توليد المتجه
 */
export function preprocessQuery(rawQuery: string): string {
  if (!rawQuery) return '';

  const rawTrimmed = rawQuery.trim();

  // 1. تنظيف وتوحيد النص العربي
  let cleaned = normalizeArabic(rawTrimmed).toLowerCase();

  // 2. إزالة الرموز الخاصة والإيموجي مع الحفاظ على الحروف والأرقام والشرطات
  cleaned = cleaned.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();

  // 3. استخراج الكلمات المفتاحية الأساسية وحذف كلمات الحشو
  const words = cleaned.split(/\s+/).filter(w => w.length > 1);
  const coreKeywords = words.filter(w => !STOP_WORDS.has(w));

  // إذا استخرجنا كلمات مفتاحية واضحة ندمج النص الأصلي المنظف مع الكلمات المفتاحية المركزة
  if (coreKeywords.length >= 2) {
    return `${rawTrimmed} | ${coreKeywords.join(' ')}`;
  }

  return rawTrimmed;
}
