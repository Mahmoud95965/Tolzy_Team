# Tolzy Platform - ملف فهم المشروع للنماذج الذكية
# آخر تحديث: 7 مايو 2026

═══════════════════════════════════════════════════════════════
## 🏗 نظرة عامة على المشروع
═══════════════════════════════════════════════════════════════

المشروع: **Tolzy** - منصة عربية شاملة لأدوات الذكاء الاصطناعي
الموقع: tolzy.me
Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS
Auth: Firebase Authentication
Database: Firebase Firestore + Supabase PostgreSQL
AI: OpenRouter API (Copilot) + Google Gemini API (Build with AI)
Hosting: Vercel

═══════════════════════════════════════════════════════════════
## 📁 هيكل الملفات الأساسي
═══════════════════════════════════════════════════════════════

```
Tolzy_Team-main/
├── app/                          # Next.js App Router (صفحات + APIs)
│   ├── layout.tsx                # Layout الرئيسي
│   ├── page.tsx                  # الصفحة الرئيسية
│   ├── api/
│   │   ├── copilot/chat/route.ts        # API المساعد الذكي (OpenRouter)
│   │   ├── build-with-ai/route.ts       # API بناء المشاريع (Gemini 2.5 Flash)
│   │   ├── build-with-ai/projects/route.ts  # API جلب المشاريع المحفوظة
│   │   ├── user/plan/route.ts           # API خطة المستخدم
│   │   ├── tools/                       # APIs الأدوات
│   │   └── auth/                        # APIs المصادقة
│   ├── build/                    # صفحة "ابنِ مع AI"
│   │   ├── page.tsx
│   │   └── projects/
│   │       ├── page.tsx                 # قائمة المشاريع
│   │       └── [id]/page.tsx            # تفاصيل مشروع
│   ├── copilot/page.tsx          # صفحة المساعد الذكي
│   ├── tools/                    # صفحة الأدوات (630+)
│   ├── learn/                    # صفحة التعلم (150+ كورس)
│   ├── auth/                     # صفحة تسجيل الدخول
│   └── profile/                  # صفحة الملف الشخصي
│
├── src/
│   ├── components/
│   │   ├── BuildWithAI/          # مكونات "ابنِ مع AI"
│   │   │   ├── IdeaInputBox.tsx         # إدخال الفكرة + اختيار المستوى
│   │   │   ├── BuildPlanViewer.tsx      # عارض النتائج (4 تبويبات)
│   │   │   ├── AIFollowUp.tsx           # لوحة Remix + أسئلة المتابعة
│   │   │   ├── ToolStackCard.tsx        # بطاقة التقنية
│   │   │   ├── StepTimeline.tsx         # خط زمني تفاعلي
│   │   │   └── PromptCard.tsx           # بطاقة البرومبت (قابلة للنسخ)
│   │   ├── Copilot/
│   │   │   └── ChatInterface.tsx        # واجهة المحادثة الرئيسية
│   │   ├── home/
│   │   │   ├── HomeClient.tsx           # الصفحة الرئيسية (مسجل/غير مسجل)
│   │   │   ├── LoggedInHome.tsx         # الصفحة للمسجلين
│   │   │   └── WhatIsTolzy.tsx          # قسم تعريف المنصة
│   │   └── layout/                      # Navbar, Footer, Sidebar
│   │
│   ├── context/
│   │   ├── AuthContext.tsx              # سياق المصادقة (Firebase)
│   │   └── ThemeContext.tsx             # سياق الثيم (Dark/Light)
│   │
│   ├── views/                           # صفحات العرض الرئيسية
│   │   ├── BuildWithAIPage.tsx          # صفحة بناء المشاريع
│   │   ├── MyProjectsPage.tsx           # صفحة مشاريعي
│   │   ├── ProjectDetailPage.tsx        # تفاصيل مشروع محفوظ
│   │   ├── CopilotPage.tsx             # صفحة المساعد
│   │   ├── ToolsPage.tsx               # صفحة الأدوات
│   │   └── ProfilePage.tsx             # الملف الشخصي
│   │
│   ├── config/
│   │   ├── firebase.ts                  # إعدادات Firebase
│   │   ├── firebase-admin.ts            # Firebase Admin SDK
│   │   └── supabaseClient.ts            # Supabase Client
│   │
│   ├── hooks/                           # Custom React Hooks
│   ├── services/                        # خدمات البيانات
│   ├── types/                           # TypeScript Types
│   └── utils/                           # أدوات مساعدة
│
├── .env                          # متغيرات البيئة
├── tailwind.config.js            # إعدادات Tailwind
├── next.config.ts                # إعدادات Next.js
└── package.json                  # التبعيات
```

═══════════════════════════════════════════════════════════════
## 🔑 المتغيرات البيئية المهمة
═══════════════════════════════════════════════════════════════

- GEMINI_API_KEY              → مفتاح Google Gemini (يُستخدم في Build with AI)
- OPENROUTER_API_KEY          → مفتاح OpenRouter (يُستخدم في Copilot)
- NEXT_PUBLIC_SUPABASE_URL    → رابط Supabase
- NEXT_PUBLIC_SUPABASE_ANON_KEY → مفتاح Supabase العام
- Firebase keys               → مصادقة المستخدمين

═══════════════════════════════════════════════════════════════
## 🧩 الميزات الرئيسية
═══════════════════════════════════════════════════════════════

### 1. دليل أدوات AI (630+ أداة)
- بحث + فلترة + تقييمات
- بطاقات تفصيلية لكل أداة
- بيانات مخزنة في Supabase مع Embeddings

### 2. Tolzy Copilot (المساعد الذكي)
- محادثة AI مع RAG (Retrieval-Augmented Generation)
- 3 نماذج: السريع / البرو / المفكر
- بحث على الإنترنت (DuckDuckGo)
- أدوات: الأكواد + ابنِ مشروعك
- حد 10 طلبات/يوم للمجانيين
- Backend: OpenRouter API

### 3. Build with AI (ابنِ مع الذكاء الاصطناعي) ⭐ جديد
- المستخدم يُدخل فكرة مشروع
- AI يولّد خطة كاملة (JSON منظم)
- 4 تبويبات: الخطة / التقنيات / الخطوات / البرومبتات
- AI Co-Pilot Sidebar (Remix Mode):
  - خليه أرخص 💰
  - خليه أسرع ⚡
  - خليه No-Code 🧩
  - حوّله SaaS 🚀
  - سؤال متابعة حر
- حفظ تلقائي في Supabase + رابط مباشر
- تصدير JSON
- نسخ كل البرومبتات
- حد 3 طلبات/يوم للمجانيين
- Backend: Google Gemini 2.5 Flash API
- Supabase Table: build_projects

### 4. Tolzy Learn (منصة التعلم)
- 150+ كورس من Coursera, Udemy, ومصادر عربية
- مشغل كورسات مدمج
- RAG للبحث في الكورسات

### 5. نظام المستخدمين
- Firebase Auth (Google, GitHub, Email)
- خطط: free / pro / ultra
- الخطط حالياً ملغية (كل المميزات مجانية)
- ملف شخصي + إشعارات

═══════════════════════════════════════════════════════════════
## 🗄️ قواعد البيانات
═══════════════════════════════════════════════════════════════

### Firebase Firestore:
- users/          → بيانات المستخدمين + الخطط + عدادات الاستخدام
- admins/         → صلاحيات الأدمن
- conversations/  → محادثات Copilot

### Supabase PostgreSQL:
- tools_embeddings  → أدوات AI مع Embeddings
- courses           → الكورسات مع Embeddings
- profiles          → FCM tokens
- build_projects    → مشاريع "ابنِ مع AI" (جديد)

═══════════════════════════════════════════════════════════════
## ⚠️ ملاحظات مهمة للعمل المستقبلي
═══════════════════════════════════════════════════════════════

1. المنصة حالياً plan-agnostic (كل المميزات متاحة للجميع)
2. نظام الاشتراكات (Stripe/Kashier) موجود في الكود لكنه معطّل
3. middleware.ts يستخدم نمط "middleware" المهمل في Next.js 16 - يُفضل استبداله بـ "proxy"
4. RLS في Supabase مُعطّل على build_projects - تأكد من تشغيل:
   ALTER TABLE build_projects DISABLE ROW LEVEL SECURITY;
5. ChatInterface.tsx ملف كبير (~1455 سطر) - يحتاج إعادة هيكلة مستقبلية
6. الـ Admin الوحيد: mahmoud.m.moussa5310@gmail.com

═══════════════════════════════════════════════════════════════
## 📦 آخر التحديثات (7 مايو 2026)
═══════════════════════════════════════════════════════════════

### ✅ تم إنجازه:
- إزالة كل قيود خطط الاشتراك من الواجهة
- إزالة قسم "Tolzy AI" من الصفحة الرئيسية
- تصميم جديد لـ Hero Section (بحث ذكي + Glassmorphism)
- إضافة LogoMarquee + WhatIsTolzy للمستخدمين المسجلين
- إصلاح أخطاء بناء في ChatInterface.tsx و HomeClient.tsx
- ميزة "Build with AI" كاملة:
  - API route مع Gemini 2.5 Flash
  - System Prompt احترافي (Startup-focused)
  - واجهة إدخال + عارض نتائج + AI Co-Pilot
  - حفظ تلقائي + صفحة مشاريع + صفحة تفاصيل
  - Remix Mode (4 خيارات) + سؤال متابعة
  - تصدير JSON + نسخ كل البرومبتات
  - حد 3 طلبات/يوم
- إضافة أداة "ابنِ مشروعك" في قائمة أدوات Copilot
- مجتمع TOLZY (Community Platform):
  - 6 أنواع محتوى: prompt, code, article, question, idea, resource
  - نظام تصويت + حفظ + ريمكس + تعليقات
  - خوارزمية Engagement Score مع Time Decay
  - فلترة بالنوع + التصنيف + الترتيب
  - Hero Section بريميوم مع Gradient + Wave SVG
- تحسين صفحة Tolzy Learn:
  - Hero Section بريميوم (Emerald Gradient + Wave SVG)
  - Search Bar بتصميم Glassmorphism
  - إحصائيات متحركة + Badge مع Pulse animation
- تحسين صفحة الأخبار والشروحات:
  - Hero Section بريميوم (Blue/Indigo Gradient + Wave SVG)
  - Tab Filter (الكل / أخبار / شروحات) مع عدادات
  - بطاقة مقال مميز (Featured) بتصميم عصري
  - بطاقات مقالات بتصميم متسق مع بقية المنصة
- توحيد التصميم عبر كل الصفحات (Premium Hero → Wave → Content)

═══════════════════════════════════════════════════════════════
## 🔧 أنماط الكود المستخدمة
═══════════════════════════════════════════════════════════════

- جميع المكونات تستخدم 'use client' مع dynamic imports
- التوجيه: Next.js App Router (app/ directory)
- الـ API routes تستخدم NextRequest/NextResponse
- Firebase Admin SDK للعمليات الخلفية (rate limiting)
- Supabase للبيانات الثقيلة (أدوات، كورسات، مشاريع)
- الثيم: Dark/Light مع useTheme()
- اللغة: عربية RTL بالكامل
- الأيقونات: lucide-react
- الأنيميشن: framer-motion
