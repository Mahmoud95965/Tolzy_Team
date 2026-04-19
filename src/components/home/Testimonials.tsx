import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  content: string;
  author: string;
  role: string;
  image: string;
}

const testimonialsList: Testimonial[] = [
  {
    content: "زكرلي ساعدني في العثور على أفضل الأدوات التعليمية الذكية. أصبح التعلم أكثر متعة وفعالية.",
    author: "سارة محمد",
    role: "معلمة لغة عربية",
    image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg"
  },
  {
    content: "المنصة رائعة وسهلة الاستخدام. وجدت العديد من الأدوات المفيدة التي ساعدتني في دراستي.",
    author: "أحمد خالد",
    role: "طالب جامعي",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
  },
  {
    content: "كمعلمة، زكرلي ساعدني في تحسين طريقة تدريسي باستخدام التكنولوجيا الحديثة.",
    author: "نورا عبدالله",
    role: "معلمة رياضيات",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg"
  },
  {
    content: "أدوات الذكاء الاصطناعي في زكرلي ساعدتني في تطوير مهاراتي البرمجية بشكل كبير.",
    author: "عمر حسن",
    role: "مطور برمجيات",
    image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
  },
  {
    content: "منصة متميزة توفر أفضل الأدوات التعليمية في مكان واحد. شكراً زكرلي!",
    author: "ليلى أحمد",
    role: "طالبة دراسات عليا",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
  },
  {
    content: "التنوع في الأدوات والمصادر التعليمية جعل من زكرلي منصة لا غنى عنها.",
    author: "محمد علي",
    role: "أستاذ جامعي",
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg"
  }
];

const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonialsList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: (isMobile: boolean) => ({
      opacity: 0,
      x: isMobile ? 30 : 60,
      transition: {
        duration: 0.15
      }
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.15
      }
    },
    exit: (isMobile: boolean) => ({
      opacity: 0,
      x: isMobile ? -30 : -60,
      transition: {
        duration: 0.15
      }
    })
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{t('testimonials.title')}</h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">{t('testimonials.subtitle')}</p>
        </div>
        
        <div className="relative h-[320px] md:h-[280px] overflow-hidden">
          <div className="absolute inset-y-0 left-0 right-0 pointer-events-none">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-gray-900 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-gray-900 to-transparent" />
          </div>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={isMobile}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'} gap-6 h-full`}>
                {(isMobile 
                  ? [testimonialsList[currentIndex]]
                  : testimonialsList.slice(currentIndex, currentIndex + 3)
                ).map((testimonial, index) => (
                  <motion.div
                    key={`${currentIndex}-${index}`}
                    className="group relative p-[1px] rounded-xl bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/20 to-emerald-500/30 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="h-full rounded-[11px] bg-white dark:bg-gray-900 ring-1 ring-gray-200/60 dark:ring-white/10 shadow-sm p-5 flex flex-col">
                      <div className="flex items-center mb-3">
                        <img
                          src={testimonial.image}
                          alt={testimonial.author}
                          className="h-10 w-10 rounded-full object-cover ml-3"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{testimonial.author}</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">{testimonial.role}</p>
                        </div>
                      </div>
                      <blockquote className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed text-right flex-grow">
                        "{testimonial.content}"
                      </blockquote>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-2">
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 shadow ring-1 ring-gray-200/60 dark:ring-white/10 hover:bg-white dark:hover:bg-gray-800 transition"
              aria-label="السابق"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonialsList.length)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 shadow ring-1 ring-gray-200/60 dark:ring-white/10 hover:bg-white dark:hover:bg-gray-800 transition"
              aria-label="التالي"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center mt-6 gap-1.5">
          {Array.from({ length: testimonialsList.length }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                  : 'w-1.5 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;