# 🧪 دليل اختبار والتحقق

## ✅ اختبارات للتحقق من أن كل شيء يعمل

### 1️⃣ اختبار الجدول

**في Supabase SQL Editor:**

```sql
-- تحقق من وجود الجدول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_limits';

-- عد الصفوف
SELECT COUNT(*) FROM public.user_limits;

-- اعرض أول 5 صفوف
SELECT * FROM public.user_limits LIMIT 5;
```

### 2️⃣ اختبار الـ API محليًا

```bash
# تشغيل التطبيق
npm run dev

# في terminal آخر - جرّب الـ API
# بدون token → يجب أن ترى خطأ 401
curl http://localhost:3000/api/admin/users

# مع Firebase token صحيح
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  http://localhost:3000/api/admin/users
```

### 3️⃣ اختبار متغيرات البيئة

```bash
# اطبع القيم (محليًا فقط!)
echo "SUPABASE_URL: $NEXT_PUBLIC_BILLING_SUPABASE_URL"
echo "Has Service Key: $([ -n "$BILLING_SUPABASE_SERVICE_ROLE_KEY" ] && echo 'YES' || echo 'NO')"
```

### 4️⃣ اختبار على Vercel

1. **تحقق من الـ Deployment:**
   ```
   https://tolzy.vercel.app/api/admin/users
   ```

2. **شيء التحقق من السجلات:**
   - اذهب إلى Vercel → Deployments → آخر deployment
   - انقر **Logs** → **Function Logs**
   - ابحث عن رسائل الأخطاء

### 5️⃣ اختبار شامل

#### الخطوة 1: تحقق من الجدول
```bash
# في Supabase SQL Editor
SELECT * FROM public.user_limits WHERE user_id = 'test-user-123';
```

#### الخطوة 2: اختبر الـ GET request محليًا
```bash
# احصل على Firebase token من localStorage
# ثم:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/users | jq '.users | length'
```

#### الخطوة 3: اختبر POST الدفع (محاكاة)
```bash
curl -X POST http://localhost:3000/api/payment/callback \
  -H "Content-Type: application/json" \
  -d '{
    "obj": {
      "success": true,
      "amount_cents": 49900,
      "order": {
        "shipping_data": {
          "email": "test@example.com"
        }
      }
    }
  }'
```

#### الخطوة 4: تحقق من Supabase
```sql
-- تحقق من أن المستخدم تم إضافته
SELECT * FROM public.user_limits WHERE user_id = 'YOUR_USER_ID';
```

---

## 📊 النتائج المتوقعة

### إذا كل شيء يعمل ✅

1. **GET users API:**
   ```json
   {
     "users": [
       {
         "uid": "user123",
         "email": "user@example.com",
         "plan": "pro",
         ...
       }
     ]
   }
   ```

2. **Supabase Query:**
   ```
   id | user_id  | plan | created_at | updated_at
   1  | user123  | pro  | 2026-04-10 | 2026-04-10
   ```

3. **Vercel Logs:**
   ```
   ✅ Token verified for email: mahmoud.m.moussa5310@gmail.com
   📊 Fetching admin users list...
   ✅ Retrieved 5 users from Firebase Auth
   ✅ Fetched plans for 3 users from Supabase
   ```

---

## 🔍 التحقق السريع

### Checklist قبل الإطلاق:

- [ ] جدول `user_limits` موجود في Supabase
- [ ] متغيرات البيئة محددة على Vercel
- [ ] يعمل محليًا: `npm run dev` → `/api/admin/users`
- [ ] يعمل على Vercel بعد `redeploy`
- [ ] الفهرس `idx_user_limits_user_id` موجود
- [ ] RLS policies مُفعّلة
- [ ] Service role key صحيح

---

## 🆘 Debug Commands

```bash
# شغّل التطبيق مع verbose logging
NODE_DEBUG=* npm run dev

# اختبر الاتصال بـ Supabase
npx supabase status --project-ref YOUR_PROJECT_ID

# اعرض جميع المتغيرات
env | grep -i supabase
```

---

## 📝 ملاحظات مهمة

1. **Service Role Key حساسة جدًا** - لا تشاركها مع أحد
2. **بعد تغيير متغيرات Vercel** - يجب redeploy
3. **تأخير الانتشار** - قد يأخذ 1-2 دقيقة حتى تصبح المتغيرات نشطة
4. **فحص الأحرف الزائدة** - تأكد من عدم وجود مسافات في البداية/النهاية
5. **تحديث الـ cache** - قد تحتاج إلى Ctrl+Shift+R لتحديث المتصفح
