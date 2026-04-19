# 🔧 حل سريع لخطأ RLS - خطوة بخطوة

## ❌ المشكلة الحالية
```
new row violates row-level security policy
```

هذا الخطأ يحصل لأن السياسات غير صحيحة.

---

## ✅ الحل الصحيح (اتبع بالضبط):

### الخطوة 1️⃣: احذف السياسات القديمة

1. اذهب إلى **Supabase Dashboard**
2. اختر مشروعك
3. انقر **Storage** من اليسار
4. اختر bucket **`payments`**
5. انقر على tab **"Policies"**
6. **تحت كل سياسة موجودة** انقر على أيقونة ⋮ (ثلاث نقاط أفقية)
7. اختر **Delete**
8. كرر حتى تحذف **كل السياسات** (يجب يكون عندك 0 سياسة)

✅ **تحقق**: الآن يجب تشوف رسالة "No policies" 

---

### الخطوة 2️⃣: أضف السياسة الأولى (للرفع)

1. اضغط **"New Policy"** الزرار الأزرق
2. اختر **"For full customization"**

**الحقول الآتية**:

| الحقل | القيمة |
|-------|--------|
| Policy name | `Allow authenticated upload` |
| Allowed operation | Select ✅ **INSERT** فقط (تأكد من إلغاء البقية) |
| Target role | اختر `authenticated` |
| Using expression | اتركها فارغة أو اكتب `true` |
| **With check expression** | **انسخ ودصق بالضبط**: |

```sql
bucket_id = 'payments' AND auth.role() = 'authenticated'
```

3. اضغط **"Review"** (من فوق على اليمين)
4. اضغط **"Save policy"**

✅ **تحقق**: ستشوف الرسالة "Policy saved successfully"

---

### الخطوة 3️⃣: أضف السياسة الثانية (للقراءة)

1. اضغط **"New Policy"** مرة ثانية
2. اختر **"For full customization"** مرة ثانية

| الحقل | القيمة |
|-------|--------|
| Policy name | `Allow read payments` |
| Allowed operation | Select ✅ **SELECT** فقط |
| Target role | اختر `anon` (للقراءة العامة) |
| Using expression | اتركها فارغة |
| **With check expression** | **انسخ ودصق**: |

```sql
bucket_id = 'payments'
```

3. اضغط **"Review"**
4. اضغط **"Save policy"**

✅ **النتيجة**: الآن عندك سياستين فقط:
- ✅ Allow authenticated upload (INSERT)
- ✅ Allow read payments (SELECT)

---

## 🧪 اختبر الآن

```bash
npm run dev
```

اذهب إلى: `http://localhost:3000/pricing`

1. اختر كود **MOFathy**
2. اضغط **"اشترك الآن"**
3. املأ البيانات
4. اختر صورة إيصال
5. اضغط **"إرسال عبر واتساب"**

✅ يجب ترى جزء طويل من URL الواتس بدون أخطاء

---

## ❓ إذا حصل خطأ ثاني

**رسالة**: "خادم التخزين غير متوفر" 
→ يعني البوكيت `payments` مش موجود. أنشئ واحد جديد بالاسم بالضبط `payments`

**رسالة**: "مشكلة في إعدادات الأمان"
→ تأكد من إن السياسات بالضبط زي ما هو مكتوب أعلاه. احذف وأضف من جديد.

---

## 📞 الدعم

لو بقي المشكلة:
1. اسكرين شوت من Supabase → Storage → Policies (أرني الرسالة)
2. اسكرين شوت من الخطأ في الموقع
3. اتواصل مع الفريق التقني
