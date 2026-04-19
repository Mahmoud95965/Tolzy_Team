# ⚙️ إعداد متغيرات البيئة على Vercel

## 🔴 المشكلة الحالية

النظام **يعمل محليًا** لكن **لا يعمل على Vercel** لأن متغيرات البيئة غير محددة على الإنتاج.

## ✅ الحل: إضافة المتغيرات على Vercel

### 1️⃣ اذهب إلى Vercel Dashboard

1. افتح [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر المشروع **Tolzy_Team**
3. انقر على **Settings** → **Environment Variables**

### 2️⃣ أضف المتغيرات التالية:

#### المتغير الأول: `NEXT_PUBLIC_BILLING_SUPABASE_URL`

| الخاصية | القيمة |
|-------|--------|
| **الاسم** | `NEXT_PUBLIC_BILLING_SUPABASE_URL` |
| **القيمة** | `https://YOUR_PROJECT.supabase.co` |
| **الحالة** | Production, Preview, Development |

**أين تجدها:**
- اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
- اختر المشروع
- في الأسفل تحت **Project URL**: انسخ الـ URL

#### المتغير الثاني: `BILLING_SUPABASE_SERVICE_ROLE_KEY`

| الخاصية | القيمة |
|-------|--------|
| **الاسم** | `BILLING_SUPABASE_SERVICE_ROLE_KEY` |
| **القيمة** | `eyJhbGciOiJIUzI1NiIsInR5...` (النص كامل) |
| **الحالة** | Production, Preview, Development |

**أين تجدها:**
- اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
- اختر المشروع
- انقر على **Settings** → **API**
- تحت **Project API keys** انسخ الـ **Service Role Key** (تحت `service_role`)

## ⚠️ تحذير أمني

🔒 **لا تنسخ Service Role Key مباشرة في الكود أو GitHub!**
- استخدم متغيرات البيئة فقط
- لا تضعها في ملفات عامة
- غير السر إذا تسرب

## 🔍 التحقق

بعد إضافة المتغيرات:

1. اذهب إلى Vercel → **Deployments**
2. انقر على **Redeploy** للـ latest commit
3. انتظر انتشار التحديثات (1-2 دقيقة)
4. جرب `/api/admin/users` مرة أخرى

## 📋 المتغيرات المطلوبة كاملة

إذا لم تكن بعض المتغيرات موجودة، أضفها أيضاً:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_BILLING_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
BILLING_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🆘 إذا استمرت المشكلة

1. تحقق من سجلات Vercel:
   - انقر على الـ Deployment
   - اذهب إلى **Logs** → **Function Logs**
   - ابحث عن أي أخطاء

2. اختبر محليًا:
   ```bash
   echo $NEXT_PUBLIC_BILLING_SUPABASE_URL
   echo $BILLING_SUPABASE_SERVICE_ROLE_KEY
   ```

3. تأكد من أن Supabase URL صحيح (يجب أن ينتهي بـ `.supabase.co`)

## 📝 ملاحظات

- عند إضافة متغيرات جديدة على Vercel، **يجب أن تُعيد نشر التطبيق** (redeploy)
- بعد الـ redeploy، قد تأخذ بعض الدقائق حتى تصبح المتغيرات نشطة
- تحقق من أن Supabase project نشط وغير معلق
