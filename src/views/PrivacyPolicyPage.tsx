"use client";
import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { Shield, Lock, Eye, FileText, Server } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageLayout>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">جمع المعلومات</h2>
        <p className="text-gray-600 leading-relaxed">
          نحن نجمع المعلومات التي تقدمها لنا عند:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-600 mr-4 space-y-2">
          <li>إنشاء حساب على منصتنا</li>
          <li>استخدام أدواتنا التعليمية</li>
          <li>التواصل معنا للدعم الفني</li>
          <li>الاشتراك في نشرتنا الإخبارية</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">استخدام المعلومات</h2>
        <p className="text-gray-600 leading-relaxed">
          نستخدم المعلومات التي نجمعها لـ:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-600 mr-4 space-y-2">
          <li>تحسين خدماتنا وأدواتنا التعليمية</li>
          <li>تخصيص تجربة المستخدم</li>
          <li>إرسال تحديثات وإشعارات مهمة</li>
          <li>تقديم الدعم الفني</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">حماية المعلومات</h2>
        <p className="text-gray-600 leading-relaxed">
          نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به والكشف والاستخدام غير المناسب. نحن نستخدم تقنيات التشفير المتقدمة ونطبق أفضل ممارسات الأمان لضمان سلامة بياناتك.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">مشاركة المعلومات</h2>
        <p className="text-gray-600 leading-relaxed">
          لا نقوم ببيع أو تأجير أو مشاركة معلوماتك الشخصية مع أطراف ثالثة إلا في الحالات التالية:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-600 mr-4 space-y-2">
          <li>بموافقتك الصريحة</li>
          <li>عندما يكون ذلك مطلوباً بموجب القانون</li>
          <li>لحماية حقوقنا القانونية</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">ملفات تعريف الارتباط</h2>
        <p className="text-gray-600 leading-relaxed">
          نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم وجمع البيانات التحليلية. يمكنك تعديل إعدادات متصفحك لرفض ملفات تعريف الارتباط، ولكن قد يؤثر ذلك على بعض وظائف الموقع.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">تحديثات السياسة</h2>
        <p className="text-gray-600 leading-relaxed">
          قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا.
        </p>
      </section>

    </PageLayout >
  );
};

export default PrivacyPolicyPage;
