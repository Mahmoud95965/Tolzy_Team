import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { generateFAQData } from '../utils/seoHelpers';

const FAQPage: React.FC = () => {
  const faqs = [
    {
      question: 'ما هو ذاكرلي؟',
      answer: 'ذاكرلي هو منصة تعليمية تهدف إلى مساعدة الطلاب والمعلمين في العملية التعليمية من خلال توفير أدوات ذكية مدعومة بالذكاء الاصطناعي.'
    },
    {
      question: 'هل الخدمة مجانية؟',
      answer: 'نعم، معظم خدماتنا مجانية. بعض الأدوات قد تتطلب اشتراكاً مدفوعاً للوصول إلى ميزات متقدمة.'
    },
    {
      question: 'كيف يمكنني البدء باستخدام المنصة؟',
      answer: 'يمكنك البدء بإنشاء حساب مجاني، ثم استكشاف الأدوات المتاحة واختيار ما يناسب احتياجاتك التعليمية.'
    },
    {
      question: 'هل يمكنني اقتراح أداة جديدة؟',
      answer: 'نعم، يمكنك اقتراح أدوات جديدة من خلال صفحة "اقتراح أداة" في منصتنا.'
    },
    {
      question: 'كيف يمكنني حفظ الأدوات المفضلة؟',
      answer: 'يمكنك حفظ الأدوات المفضلة بالنقر على زر "حفظ" في صفحة الأداة. ستظهر الأدوات المحفوظة في صفحة ملفك الشخصي.'
    }
  ];

  // Generate FAQ schema
  const faqSchema = generateFAQData(faqs);

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          الأسئلة الشائعة
        </h1>
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQPage;
