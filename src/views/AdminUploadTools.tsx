import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { Upload, FileJson, FileSpreadsheet, CheckCircle, XCircle, Download, AlertTriangle, SkipForward } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Tool } from '../types/tool';
import * as XLSX from 'xlsx';

const AdminUploadTools: React.FC = () => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTool, setCurrentTool] = useState<string>('');
  const [totalTools, setTotalTools] = useState(0);
  const [processedTools, setProcessedTools] = useState(0);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    skipped: number;
    errors: string[];
    skippedTools: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileType === 'json' || fileType === 'xlsx' || fileType === 'xls') {
        setFile(selectedFile);
        setResults(null);
      } else {
        alert('يرجى اختيار ملف JSON أو Excel (.xlsx, .xls)');
      }
    }
  };

  const validateTool = (tool: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!tool.id) errors.push('معرف الأداة (id) مطلوب');
    if (!tool.name) errors.push('اسم الأداة (name) مطلوب');
    if (!tool.description) errors.push('الوصف (description) مطلوب');
    if (!tool.category) errors.push('الفئة (category) مطلوبة');
    if (!tool.url) errors.push('الرابط (url) مطلوب');
    if (!tool.pricing) errors.push('نموذج التسعير (pricing) مطلوب');
    if (!tool.features || !Array.isArray(tool.features)) {
      errors.push('المميزات (features) مطلوبة ويجب أن تكون مصفوفة');
    }
    if (typeof tool.rating !== 'number' || tool.rating < 0 || tool.rating > 5) {
      errors.push('التقييم (rating) يجب أن يكون رقماً بين 0 و 5');
    }

    return { valid: errors.length === 0, errors };
  };

  const parseExcelToTools = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // تحويل البيانات من Excel إلى تنسيق Tool
          const tools = jsonData.map((row: any) => {
            // تحويل النصوص المفصولة بفواصل إلى مصفوفات
            const features = row.features ? row.features.split('|').map((f: string) => f.trim()) : [];
            const tags = row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [];
            const pros = row.pros ? row.pros.split('|').map((p: string) => p.trim()) : [];
            const cons = row.cons ? row.cons.split('|').map((c: string) => c.trim()) : [];
            const subcategory = row.subcategory ? row.subcategory.split(',').map((s: string) => s.trim()) : [];

            return {
              id: row.id || `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: row.name,
              description: row.description,
              longDescription: row.longDescription || row.description,
              category: row.category,
              subcategory: subcategory.length > 0 ? subcategory : undefined,
              tags: tags,
              url: row.url,
              imageUrl: row.imageUrl || '',
              pricing: row.pricing,
              features: features,
              pros: pros.length > 0 ? pros : undefined,
              cons: cons.length > 0 ? cons : undefined,
              rating: parseFloat(row.rating) || 0,
              reviewCount: parseInt(row.reviewCount) || 0,
              isNew: row.isNew === 'true' || row.isNew === true || false,
              isFeatured: row.isFeatured === 'true' || row.isFeatured === true || false,
              isPopular: row.isPopular === 'true' || row.isPopular === true || false,
              status: 'approved'
            };
          });

          resolve(tools);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
      reader.readAsBinaryString(file);
    });
  };

  const checkDuplicateTool = async (toolName: string, toolUrl: string): Promise<boolean> => {
    try {
      // التحقق من الاسم
      const nameQuery = query(
        collection(db, 'tools'),
        where('name', '==', toolName)
      );
      const nameSnapshot = await getDocs(nameQuery);

      if (!nameSnapshot.empty) {
        return true;
      }

      // التحقق من الرابط
      const urlQuery = query(
        collection(db, 'tools'),
        where('url', '==', toolUrl)
      );
      const urlSnapshot = await getDocs(urlQuery);

      return !urlSnapshot.empty;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false;
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setResults(null);
    setProgress(0);
    setProcessedTools(0);

    try {
      let tools: any[] = [];

      // قراءة الملف حسب نوعه
      if (file.name.endsWith('.json')) {
        const fileContent = await file.text();
        const data = JSON.parse(fileContent);
        tools = Array.isArray(data) ? data : data.tools || [];
      } else {
        // Excel file
        tools = await parseExcelToTools(file);
      }

      if (tools.length === 0) {
        alert('الملف لا يحتوي على أدوات');
        setUploading(false);
        return;
      }

      setTotalTools(tools.length);

      let successCount = 0;
      let failedCount = 0;
      let skippedCount = 0;
      const errorMessages: string[] = [];
      const skippedToolsList: string[] = [];

      // رفع كل أداة إلى Firebase
      for (let i = 0; i < tools.length; i++) {
        const tool = tools[i];
        setCurrentTool(tool.name || `أداة ${i + 1}`);

        // تأخير صغير لجعل التقدم مرئياً
        await new Promise(resolve => setTimeout(resolve, 100));

        const validation = validateTool(tool);

        if (!validation.valid) {
          failedCount++;
          errorMessages.push(`${tool.name || 'أداة غير معروفة'}: ${validation.errors.join(', ')}`);
          continue;
        }

        // التحقق من التكرار
        const isDuplicate = await checkDuplicateTool(tool.name, tool.url);
        if (isDuplicate) {
          skippedCount++;
          skippedToolsList.push(tool.name);
          continue;
        }

        try {
          const toolData: Partial<Tool> = {
            ...tool,
            submittedBy: user.uid,
            submittedAt: new Date().toISOString(),
            status: 'approved',
            votes: {
              helpful: [],
              notHelpful: []
            },
            votingStats: {
              helpfulCount: 0,
              notHelpfulCount: 0,
              totalVotes: 0
            },
            savedBy: []
          };

          await addDoc(collection(db, 'tools'), toolData);
          successCount++;
        } catch (error) {
          failedCount++;
          errorMessages.push(`${tool.name}: فشل في الرفع - ${error}`);
        }

        // تحديث التقدم بعد معالجة كل أداة
        setProcessedTools(i + 1);
        setProgress(Math.round(((i + 1) / tools.length) * 100));
      }

      setResults({
        success: successCount,
        failed: failedCount,
        skipped: skippedCount,
        errors: errorMessages,
        skippedTools: skippedToolsList
      });

    } catch (error) {
      alert('خطأ في قراءة الملف: ' + error);
    } finally {
      setUploading(false);
    }
  };

  const downloadExcelTemplate = () => {
    const template = [
      {
        id: 'tool-001',
        name: 'اسم الأداة',
        description: 'وصف قصير للأداة',
        longDescription: 'وصف تفصيلي للأداة',
        category: 'Video',
        subcategory: 'Video Editing,Video Enhancement',
        tags: 'تحرير فيديو,ذكاء اصطناعي,تحسين',
        url: 'https://example.com',
        imageUrl: '',
        pricing: 'Freemium',
        features: 'ميزة 1|ميزة 2|ميزة 3',
        pros: 'سهل الاستخدام|سريع|فعال',
        cons: 'مكلف|يحتاج تدريب',
        rating: '4.5',
        reviewCount: '100',
        isNew: 'false',
        isFeatured: 'true',
        isPopular: 'true'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tools');
    XLSX.writeFile(wb, 'tools-template.xlsx');
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            رفع الأدوات
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            رفع الأدوات من ملفات JSON أو Excel
          </p>
        </div>

        {/* أزرار التنزيل */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={downloadExcelTemplate}
            className="flex items-center justify-center gap-3 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <div className="text-right">
              <div className="font-semibold">تحميل قالب Excel</div>
              <div className="text-sm opacity-90">ملف Excel جاهز للتعبئة</div>
            </div>
          </button>

          <a
            href="/tools-example-with-subcategories.json"
            download
            className="flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <div className="text-right">
              <div className="font-semibold">تحميل مثال JSON</div>
              <div className="text-sm opacity-90">ملف JSON جاهز للتعديل</div>
            </div>
          </a>
        </div>

        {/* منطقة رفع الملفات */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 mb-6">
          <div className="text-center">
            <div className="flex justify-center gap-4 mb-4">
              <FileJson className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
              <FileSpreadsheet className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              رفع ملف JSON أو Excel
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              اختر ملف JSON (.json) أو Excel (.xlsx, .xls) يحتوي على الأدوات
            </p>

            <input
              type="file"
              accept=".json,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              اختيار ملف
            </label>

            {file && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">الملف المحدد:</span> {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  الحجم: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* زر الرفع */}
        {file && (
          <div className="mb-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {uploading ? 'جاري الرفع...' : 'رفع الأدوات إلى قاعدة البيانات'}
            </button>
          </div>
        )}

        {/* شريط التقدم */}
        {uploading && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  جاري المعالجة...
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {progress}%
                </span>
              </div>

              {/* شريط التقدم */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end"
                  style={{ width: `${progress}%` }}
                >
                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* معلومات التقدم */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">الأدوات المعالجة:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {processedTools} / {totalTools}
                </span>
              </div>

              {currentTool && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 truncate">
                      جاري معالجة: {currentTool}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* النتائج */}
        {results && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              نتائج الرفع
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    نجح
                  </span>
                </div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {results.success}
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <SkipForward className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-semibold text-yellow-900 dark:text-yellow-100">
                    متخطى
                  </span>
                </div>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {results.skipped}
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-red-900 dark:text-red-100">
                    فشل
                  </span>
                </div>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {results.failed}
                </p>
              </div>
            </div>

            {results.skippedTools.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  الأدوات المتخطاة (موجودة مسبقاً):
                </h4>
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {results.skippedTools.map((toolName, index) => (
                    <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                      • {toolName}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  الأخطاء:
                </h4>
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* تعليمات */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              تنسيق JSON
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• ملف JSON عادي</li>
              <li>• مصفوفة من الأدوات</li>
              <li>• جميع الحقول المطلوبة</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              تنسيق Excel
            </h3>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <li>• كل صف = أداة واحدة</li>
              <li>• افصل القوائم بـ | (pipe)</li>
              <li>• افصل الوسوم بـ , (comma)</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminUploadTools;
