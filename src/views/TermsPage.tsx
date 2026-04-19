"use client";
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { FileText, CheckCircle, AlertTriangle, UserX, Scale } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <PageLayout>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">قبول الشروط</h2>
        <p className="text-gray-600 leading-relaxed">
          باستخدامك لمنصتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام خدماتنا.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">حسابات المستخدمين</h2>
        <ul className="list-disc list-inside mt-2 text-gray-600 mr-4 space-y-2">
          <li>يجب أن تكون المعلومات المقدمة عند إنشاء الحساب دقيقة وكاملة</li>
          <li>أنت مسؤول عن الحفاظ على سرية معلومات حسابك</li>
          <li>يحق لنا إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">استخدام المنصة</h2>
        <p className="text-gray-600 leading-relaxed">
          يجب استخدام المنصة وفقاً للقوانين المعمول بها وبطريقة مسؤولة. يحظر:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-600 mr-4 space-y-2">
          <li>نشر محتوى غير قانوني أو مسيء</li>
          <li>انتهاك حقوق الملكية الفكرية</li>
          <li>محاولة اختراق أو تعطيل المنصة</li>
          <li>إساءة استخدام موارد المنصة</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">الملكية الفكرية</h2>
        <p className="text-gray-600 leading-relaxed">
          جميع المحتوى المتاح على المنصة، بما في ذلك النصوص والصور والشعارات والبرمجيات، هو ملك لنا أو لمرخصينا. لا يجوز نسخ أو توزيع أو تعديل هذا المحتوى دون إذن صريح.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">المحتوى المستخدم</h2>
        <p className="text-gray-600 leading-relaxed">
          عند نشر أي محتوى على منصتنا:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-600 mr-4 space-y-2">
          <li>تضمن أن لديك الحق في نشر هذا المحتوى</li>
          <li>تمنحنا ترخيصاً عالمياً لاستخدام هذا المحتوى</li>
          <li>توافق على عدم نشر محتوى يخالف حقوق الآخرين</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">إخلاء المسؤولية</h2>
        <p className="text-gray-600 leading-relaxed">
          يتم تقديم منصتنا "كما هي" دون أي ضمانات. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة تنتج عن استخدام منصتنا.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">تعديل الشروط</h2>
        <p className="text-gray-600 leading-relaxed">
          نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بالتغييرات الجوهرية قبل دخولها حيز التنفيذ.
        </p>
      </section>

    </PageLayout >
  );
};

export default TermsPage;
