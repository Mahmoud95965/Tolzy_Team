import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const privateKey = rawPrivateKey
  ? rawPrivateKey.replace(/\\n/g, '\n')
  : '';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  });
}

const db = admin.firestore();

const newChangelogItems = [
  {
    version: "",
    date: "2026-06-03",
    title: "إطلاق مساعد AXIOM 🤖",
    type: "major",
    category: "ai",
    isHero: true,
    iconType: "cpu",
    imageUrl: "https://zdhjnbsjkglumsakpmoj.supabase.co/storage/v1/object/public/changelog/62shots_so.jpg",
    changes: [
      "الترقية الأكبر لمحرك المساعد الذكي وتكامل أعمق مع بيئة العمل. تم التدريب +1000 أداة متخصصة لتقديم إجابات فائقة الدقة.",
      "سحق الأخطاء (Bug Fix): حل مشكلة الـ Infinite Read Loop الحرجة في بيئة Firebase (وتحديداً في ملف معالجة المحادثات الحوارية ChatInterface.tsx) والتي كانت تسبب استهلاكاً ضخماً للموارد وتؤثر على الأداء اليومي.",
      "مؤشر الأداء: تحسين زمن الاستجابة الفوري وتقليل الـ LCP والـ TBT، مما نتج عنه زيادة في السرعة بنسبة 40% لتجربة تصفح انسيابية تماماً."
    ]
  },
  {
    version: "v2.4.0",
    date: "2026-05-25",
    title: "إطلاق نظام TOLZY Prompts الجديد ⚡",
    type: "minor",
    category: "ai",
    isExploreCard: true,
    iconType: "sparkles",
    imageUrl: "https://zdhjnbsjkglumsakpmoj.supabase.co/storage/v1/object/public/changelog/559shots_so.webp",
    changes: [
      "تحويل أوامر واستعلامات الذكاء الاصطناعي من مجرد نصوص عادية إلى مسارات عمل متكاملة (Workflows).",
      "دمج نماذج متطورة لتنقية المخرجات وتقليل الهلوسة التقنية لتقديم نتائج تخصصية تخدم المطورين ورواد الأعمال."
    ]
  },
  {
    version: "v2.3.0",
    date: "2026-05-18",
    title: "ولادة أداة TOLZY Build 🛠️",
    type: "minor",
    category: "other",
    iconType: "zap",
    imageUrl: "https://zdhjnbsjkglumsakpmoj.supabase.co/storage/v1/object/public/changelog/50shots_so.jpg",
    changes: [
      "المحرك الهيكلي والإنشائي الجديد الذي يتيح للمستخدمين والمطورين ترجمة أفكارهم البرمجية وتوليد مجسمات نماذج أولية (Prototypes) جاهزة للاستخدام في ثوانٍ معدودة."
    ]
  },
  {
    version: "v2.2.0",
    date: "2026-05-10",
    title: "إعادة الهيكلة البصرية للمجتمع (Community Revamp) 🎨",
    type: "minor",
    category: "ui",
    iconType: "layout",
    imageUrl: "https://zdhjnbsjkglumsakpmoj.supabase.co/storage/v1/object/public/changelog/911shots_so.webp",
    changes: [
      "إعادة تصميم واجهة تصفح المجتمع بالكامل لتتبنى لغة تصميم Glassmorphic راقية (خلفيات معتمة مع تأثير زجاجي بلوري مطفي ومستوحى من جماليات تيمات Apple)، لتوفر تباينًا عاليًا مريحًا للعين."
    ]
  },
  {
    version: "v2.1.0",
    date: "2026-05-05",
    title: "إطلاق ميزة \"المبدعون\" (Creators Hub) 👥",
    type: "minor",
    category: "community",
    iconType: "sparkles",
    changes: [
      "الدليل المفتوح: إمكانية تصفح قائمة شاملة تضم جميع المبدعين وصناع القيمة التقنية داخل المنظومة.",
      "الملفات الشخصية التفاعلية: القدرة على الدخول المباشر إلى الـ Profile الخاص بأي عضو، ومراجعة كافة منشوراته ومساهماته السابقة، وبناء علاقات عمل حقيقية."
    ]
  },
  {
    version: "v2.0.0",
    date: "2026-05-01",
    title: "إنجازات النمو التاريخية وإعادة التموضع 📈",
    type: "major",
    category: "other",
    iconType: "zap",
    changes: [
      "رقم قياسي للمستخدمين: تحقيق طفرة ملموسة في حجم التفاعل والوصول إلى حاجز 4,000 مستخدم نشط شهرياً على المنصة.",
      "إعادة التموضع الاستراتيجي (Platform Pivot): اتخاذ قرار جريء بإيقاف الموقع العام \"TOLZY AI\" لتركيز كافة الموارد والجهود الهندسية وتوجيهها لدعم وتطوير الوحدات التخصصية الاحترافية والناجحة مثل TOLZY Prompts و TOLZY Build."
    ]
  }
];

async function seed() {
  console.log('Clearing old changelog items from Firestore...');
  const snapshot = await db.collection('changelog').get();
  for (const doc of snapshot.docs) {
    await doc.ref.delete();
    console.log(`Deleted doc: ${doc.id}`);
  }

  console.log('Inserting new premium updates...');
  for (const item of newChangelogItems) {
    const docRef = await db.collection('changelog').add({
      ...item,
      isHero: item.isHero || false,
      isExploreCard: item.isExploreCard || false,
      link: "",
      htmlContent: ""
    });
    console.log(`Added doc: ${docRef.id} with title "${item.title}"`);
  }

  console.log('Seeding completed successfully! ✅');
}

seed().catch(console.error);
