'use client';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    الصفحة غير موجودة
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
                </p>
                <a
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    العودة للرئيسية
                </a>
            </div>
        </div>
    );
}
