"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import PageLayout from '../components/layout/PageLayout';
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Download, 
  AlertTriangle, 
  SkipForward,
  RefreshCw,
  Search,
  Edit3,
  Layers,
  Sparkles,
  ArrowRight,
  Save,
  Eye,
  Check,
  Tag,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Tool, ToolCategory, ToolPricing } from '../types/tool';
import ToolImage from '../components/common/ToolImage';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

type ActiveAdminTab = 'smart_upload' | 'direct_editor';
type UploadMode = 'upsert' | 'update_only' | 'insert_only';

interface ParsedToolItem {
  raw: any;
  tool: Partial<Tool>;
  valid: boolean;
  errors: string[];
  isRecognized: boolean;
  matchedDocId?: string;
  matchedExistingTool?: Tool;
  diffSummary?: string[];
}

export default function AdminUploadTools() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveAdminTab>('smart_upload');

  // ─── TAB 1: SMART BULK UPLOAD STATE ────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>('upsert');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedTools, setAnalyzedTools] = useState<ParsedToolItem[] | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentProcessingName, setCurrentProcessingName] = useState<string>('');
  const [processedCount, setProcessedCount] = useState(0);

  const [finalResults, setFinalResults] = useState<{
    inserted: number;
    updated: number;
    skipped: number;
    failed: number;
    updatedList: string[];
    insertedList: string[];
    skippedList: string[];
    errorList: string[];
  } | null>(null);

  // ─── TAB 2: DIRECT TOOL EDITOR STATE ───────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [dbTools, setDbTools] = useState<Tool[]>([]);
  const [isLoadingDbTools, setIsLoadingDbTools] = useState(false);
  const [selectedToolToEdit, setSelectedToolToEdit] = useState<Tool | null>(null);
  const [isSavingDirectEdit, setIsSavingDirectEdit] = useState(false);

  // Cached Map of all Firestore tools for fast 0ms matching
  const [existingToolsMap, setExistingToolsMap] = useState<{
    byId: Map<string, { docId: string; tool: Tool }>;
    byName: Map<string, { docId: string; tool: Tool }>;
    byUrl: Map<string, { docId: string; tool: Tool }>;
    list: Tool[];
  }>({
    byId: new Map(),
    byName: new Map(),
    byUrl: new Map(),
    list: []
  });

  // Normalize URL helper (removes protocol, www, trailing slash)
  const normalizeUrl = (url: string = ''): string => {
    return url
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/+$/, '');
  };

  // Normalize name helper
  const normalizeName = (name: string = ''): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  };

  // Load existing tools from Firestore once
  const loadExistingToolsIndex = async () => {
    setIsLoadingDbTools(true);
    try {
      const snap = await getDocs(collection(db, 'tools'));
      const byId = new Map<string, { docId: string; tool: Tool }>();
      const byName = new Map<string, { docId: string; tool: Tool }>();
      const byUrl = new Map<string, { docId: string; tool: Tool }>();
      const list: Tool[] = [];

      snap.forEach((d) => {
        const data = d.data() as Tool;
        const toolObj = { ...data, id: d.id };
        list.push(toolObj);

        if (d.id) byId.set(d.id.toLowerCase(), { docId: d.id, tool: toolObj });
        if (data.id) byId.set(data.id.toLowerCase(), { docId: d.id, tool: toolObj });
        if (data.name) byName.set(normalizeName(data.name), { docId: d.id, tool: toolObj });
        if (data.url) byUrl.set(normalizeUrl(data.url), { docId: d.id, tool: toolObj });
      });

      setExistingToolsMap({ byId, byName, byUrl, list });
      setDbTools(list);
    } catch (err) {
      console.error('Failed to load tools index from Firestore:', err);
    } finally {
      setIsLoadingDbTools(false);
    }
  };

  useEffect(() => {
    loadExistingToolsIndex();
  }, []);

  // Validation function
  const validateToolData = (tool: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!tool.name) errors.push('اسم الأداة (name) مطلوب');
    if (!tool.description && !tool.longDescription) errors.push('الوصف مطلوب');
    if (!tool.category) errors.push('الفئة (category) مطلوبة');
    if (!tool.url) errors.push('الرابط (url) مطلوب');
    return { valid: errors.length === 0, errors };
  };

  // Compare existing tool with new tool to generate human-readable diff
  const computeDiff = (existing: Tool, incoming: Partial<Tool>): string[] => {
    const changes: string[] = [];

    if (incoming.pricing && incoming.pricing !== existing.pricing) {
      changes.push(`تغيير السعر من (${existing.pricing}) إلى (${incoming.pricing})`);
    }
    if (incoming.url && normalizeUrl(incoming.url) !== normalizeUrl(existing.url)) {
      changes.push('تحديث رابط الأداة الرسمي');
    }
    if (incoming.description && incoming.description !== existing.description) {
      changes.push('تحديث الوصف المختصر');
    }
    if (incoming.longDescription && incoming.longDescription !== existing.longDescription) {
      changes.push('تحديث الوصف التفصيلي');
    }
    if (incoming.imageUrl && incoming.imageUrl !== existing.imageUrl) {
      changes.push('تحديث صورة/شعار الأداة');
    }
    if (incoming.rating !== undefined && incoming.rating !== existing.rating) {
      changes.push(`تحديث التقييم (${incoming.rating})`);
    }
    if (incoming.features && Array.isArray(incoming.features) && incoming.features.length > 0) {
      changes.push(`تحديث المميزات (${incoming.features.length} ميزة)`);
    }
    if (incoming.pros && Array.isArray(incoming.pros) && incoming.pros.length > 0) {
      changes.push(`تحديث الإيجابيات (${incoming.pros.length})`);
    }
    if (incoming.cons && Array.isArray(incoming.cons) && incoming.cons.length > 0) {
      changes.push(`تحديث السلبيات (${incoming.cons.length})`);
    }
    if (incoming.tags && Array.isArray(incoming.tags)) {
      changes.push(`تحديث الوسوم (${incoming.tags.length} وسم)`);
    }
    if (incoming.isFeatured !== undefined && incoming.isFeatured !== existing.isFeatured) {
      changes.push(incoming.isFeatured ? 'تمييز الأداة (Featured)' : 'إلغاء التمييز');
    }

    if (changes.length === 0) {
      changes.push('تحديث عام لبيانات الأداة');
    }

    return changes;
  };

  // Parse Excel to tools array
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

          const tools = jsonData.map((row: any) => {
            const features = row.features 
              ? (Array.isArray(row.features) ? row.features : String(row.features).split('|').map((f: string) => f.trim()))
              : [];
            const tags = row.tags 
              ? (Array.isArray(row.tags) ? row.tags : String(row.tags).split(',').map((t: string) => t.trim()))
              : [];
            const pros = row.pros 
              ? (Array.isArray(row.pros) ? row.pros : String(row.pros).split('|').map((p: string) => p.trim()))
              : [];
            const cons = row.cons 
              ? (Array.isArray(row.cons) ? row.cons : String(row.cons).split('|').map((c: string) => c.trim()))
              : [];
            const subcategory = row.subcategory 
              ? (Array.isArray(row.subcategory) ? row.subcategory : String(row.subcategory).split(',').map((s: string) => s.trim()))
              : undefined;

            return {
              id: row.id || undefined,
              name: row.name ? String(row.name).trim() : '',
              description: row.description ? String(row.description).trim() : '',
              longDescription: row.longDescription ? String(row.longDescription).trim() : (row.description || ''),
              category: row.category || 'Other',
              subcategory: subcategory && subcategory.length > 0 ? subcategory : undefined,
              tags: tags,
              url: row.url ? String(row.url).trim() : '',
              imageUrl: row.imageUrl || '',
              pricing: (row.pricing as ToolPricing) || 'Freemium',
              features: features,
              pros: pros.length > 0 ? pros : undefined,
              cons: cons.length > 0 ? cons : undefined,
              rating: parseFloat(row.rating) || 4.5,
              reviewCount: parseInt(row.reviewCount) || 10,
              isNew: String(row.isNew).toLowerCase() === 'true',
              isFeatured: String(row.isFeatured).toLowerCase() === 'true',
              isPopular: String(row.isPopular).toLowerCase() === 'true',
              status: 'approved'
            };
          });

          resolve(tools);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('فشل في قراءة ملف الإكسل'));
      reader.readAsBinaryString(file);
    });
  };

  // Handle file selection and immediate smart pre-analysis
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'json' && fileType !== 'xlsx' && fileType !== 'xls') {
      toast.error('يرجى اختيار ملف JSON أو Excel (.xlsx, .xls)');
      return;
    }

    setFile(selectedFile);
    setFinalResults(null);
    setIsAnalyzing(true);

    try {
      let rawTools: any[] = [];
      if (fileType === 'json') {
        const text = await selectedFile.text();
        const json = JSON.parse(text);
        rawTools = Array.isArray(json) ? json : json.tools || [];
      } else {
        rawTools = await parseExcelToTools(selectedFile);
      }

      if (rawTools.length === 0) {
        toast.error('الملف المختار فارغ ولا يحتوي على أدوات');
        setIsAnalyzing(false);
        return;
      }

      // Perform matching against Firestore index
      const analyzed: ParsedToolItem[] = rawTools.map((raw) => {
        // Auto sanitize
        const toolItem: Partial<Tool> = {
          ...raw,
          name: raw.name ? String(raw.name).trim() : '',
          description: raw.description ? String(raw.description).trim() : '',
          longDescription: raw.longDescription ? String(raw.longDescription).trim() : (raw.description || ''),
          category: raw.category || 'Other',
          pricing: raw.pricing || 'Freemium',
          url: raw.url ? String(raw.url).trim() : '',
          features: Array.isArray(raw.features) ? raw.features : (raw.features ? String(raw.features).split('|') : []),
          tags: Array.isArray(raw.tags) ? raw.tags : (raw.tags ? String(raw.tags).split(',') : []),
          rating: typeof raw.rating === 'number' ? raw.rating : (parseFloat(raw.rating) || 4.5),
        };

        const validation = validateToolData(toolItem);

        // Matching logic
        let matched: { docId: string; tool: Tool } | undefined;
        if (toolItem.id && existingToolsMap.byId.has(toolItem.id.toLowerCase())) {
          matched = existingToolsMap.byId.get(toolItem.id.toLowerCase());
        } else if (toolItem.name && existingToolsMap.byName.has(normalizeName(toolItem.name))) {
          matched = existingToolsMap.byName.get(normalizeName(toolItem.name));
        } else if (toolItem.url && existingToolsMap.byUrl.has(normalizeUrl(toolItem.url))) {
          matched = existingToolsMap.byUrl.get(normalizeUrl(toolItem.url));
        }

        const isRecognized = Boolean(matched);
        const diffSummary = matched ? computeDiff(matched.tool, toolItem) : undefined;

        return {
          raw,
          tool: toolItem,
          valid: validation.valid,
          errors: validation.errors,
          isRecognized,
          matchedDocId: matched?.docId,
          matchedExistingTool: matched?.tool,
          diffSummary
        };
      });

      setAnalyzedTools(analyzed);
      toast.success(`تم فحص وتحليل ${analyzed.length} أداة بنجاح!`);
    } catch (err: any) {
      console.error('File parsing error:', err);
      toast.error('حدث خطأ أثناء قراءة الملف: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Breakdown metrics of analyzed file
  const analysisStats = useMemo(() => {
    if (!analyzedTools) return null;
    const total = analyzedTools.length;
    const recognized = analyzedTools.filter((t) => t.valid && t.isRecognized).length;
    const brandNew = analyzedTools.filter((t) => t.valid && !t.isRecognized).length;
    const invalid = analyzedTools.filter((t) => !t.valid).length;
    return { total, recognized, brandNew, invalid };
  }, [analyzedTools]);

  // Execute Upload & Update Process
  const handleExecuteUpload = async () => {
    if (!analyzedTools || analyzedTools.length === 0 || !user) return;

    setUploading(true);
    setProgress(0);
    setProcessedCount(0);
    setFinalResults(null);

    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    const updatedList: string[] = [];
    const insertedList: string[] = [];
    const skippedList: string[] = [];
    const errorList: string[] = [];

    const total = analyzedTools.length;

    for (let i = 0; i < total; i++) {
      const item = analyzedTools[i];
      const toolName = item.tool.name || `أداة #${i + 1}`;
      setCurrentProcessingName(toolName);

      if (!item.valid) {
        failedCount++;
        errorList.push(`${toolName}: ${item.errors.join(', ')}`);
        setProcessedCount(i + 1);
        setProgress(Math.round(((i + 1) / total) * 100));
        continue;
      }

      // Check upload strategy
      if (item.isRecognized) {
        if (uploadMode === 'insert_only') {
          // Skip existing tool
          skippedCount++;
          skippedList.push(`${toolName} (تم التخطي بحسب وضع الرفع المحدد)`);
        } else {
          // Perform Smart Update / Upsert
          try {
            const docId = item.matchedDocId!;
            const existing = item.matchedExistingTool!;

            // Merge carefully: Preserve votes, savedBy, community counters
            const updatePayload: any = {
              name: item.tool.name || existing.name,
              description: item.tool.description || existing.description,
              longDescription: item.tool.longDescription || existing.longDescription || item.tool.description,
              category: item.tool.category || existing.category,
              subcategory: item.tool.subcategory !== undefined ? item.tool.subcategory : existing.subcategory,
              tags: item.tool.tags && item.tool.tags.length > 0 ? item.tool.tags : existing.tags,
              url: item.tool.url || existing.url,
              imageUrl: item.tool.imageUrl || existing.imageUrl,
              pricing: item.tool.pricing || existing.pricing,
              features: item.tool.features && item.tool.features.length > 0 ? item.tool.features : existing.features,
              pros: item.tool.pros !== undefined ? item.tool.pros : existing.pros,
              cons: item.tool.cons !== undefined ? item.tool.cons : existing.cons,
              rating: item.tool.rating !== undefined ? item.tool.rating : existing.rating,
              isNew: item.tool.isNew !== undefined ? item.tool.isNew : existing.isNew,
              isFeatured: item.tool.isFeatured !== undefined ? item.tool.isFeatured : existing.isFeatured,
              isPopular: item.tool.isPopular !== undefined ? item.tool.isPopular : existing.isPopular,
              status: 'approved',
              updatedAt: new Date().toISOString(),
              updatedBy: user.uid
            };

            await setDoc(doc(db, 'tools', docId), updatePayload, { merge: true });
            updatedCount++;
            updatedList.push(`${toolName} (تم تحديث: ${item.diffSummary?.slice(0, 2).join('، ')})`);
          } catch (err: any) {
            failedCount++;
            errorList.push(`${toolName}: فشل التحديث - ${err.message}`);
          }
        }
      } else {
        // Brand New Tool
        if (uploadMode === 'update_only') {
          skippedCount++;
          skippedList.push(`${toolName} (أداة جديدة تم تخطيها بحسب وضع التحديث فقط)`);
        } else {
          try {
            const generatedId = item.tool.id || `tool-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
            const newToolData: any = {
              ...item.tool,
              id: generatedId,
              status: 'approved',
              submittedBy: user.uid,
              submittedAt: new Date().toISOString(),
              votes: { helpful: [], notHelpful: [] },
              votingStats: { helpfulCount: 0, notHelpfulCount: 0, totalVotes: 0 },
              savedBy: []
            };

            await addDoc(collection(db, 'tools'), newToolData);
            insertedCount++;
            insertedList.push(toolName);
          } catch (err: any) {
            failedCount++;
            errorList.push(`${toolName}: فشل الإضافة - ${err.message}`);
          }
        }
      }

      setProcessedCount(i + 1);
      setProgress(Math.round(((i + 1) / total) * 100));
    }

    setFinalResults({
      inserted: insertedCount,
      updated: updatedCount,
      skipped: skippedCount,
      failed: failedCount,
      updatedList,
      insertedList,
      skippedList,
      errorList
    });

    setUploading(false);
    toast.success('اكتملت معالجة ورفع الملف بنجاح!');
    loadExistingToolsIndex(); // Refresh local index
  };

  // Download sample templates
  const downloadExcelTemplate = () => {
    const sample = [
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        description: 'روبوت محادثة ونموذج ذكاء اصطناعي رائد لمعالجة اللغات الطبيعية.',
        longDescription: 'نموذج ذكاء اصطناعي فائق يدعم الكتابة والتحليل والبرمجة وحل المشكلات بدقة عالية.',
        category: 'Writing',
        subcategory: 'Content Writing,Copywriting',
        tags: 'ذكاء اصطناعي,شات,كتابة,برمجة',
        url: 'https://chatgpt.com',
        imageUrl: '',
        pricing: 'Freemium',
        features: 'كتابة محتوى|توليد كود|تحليل ملفات|دعم اللغة العربية',
        pros: 'واجهة بديهية|استجابة فائقة السرعة|تكامل واسع',
        cons: 'بعض الميزات المتقدمة مدفوعة',
        rating: '4.9',
        reviewCount: '150',
        isNew: 'false',
        isFeatured: 'true',
        isPopular: 'true'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TOLZY_Tools');
    XLSX.writeFile(wb, 'tolzy-tools-template.xlsx');
  };

  // Filtered tools for TAB 2 (Direct search and edit)
  const filteredSearchTools = useMemo(() => {
    if (!searchQuery.trim()) return dbTools.slice(0, 15);
    const q = searchQuery.toLowerCase().trim();
    return dbTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (Array.isArray(t.category) ? t.category.some(c => c.toLowerCase().includes(q)) : t.category?.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [dbTools, searchQuery]);

  // Handle direct tool save
  const handleSaveDirectEdit = async () => {
    if (!selectedToolToEdit || !selectedToolToEdit.id) return;
    setIsSavingDirectEdit(true);

    try {
      const toolRef = doc(db, 'tools', selectedToolToEdit.id);
      const updateData = {
        ...selectedToolToEdit,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'admin'
      };

      await setDoc(toolRef, updateData, { merge: true });
      toast.success(`تم حفظ تحديث أداة ${selectedToolToEdit.name} بنجاح!`);
      loadExistingToolsIndex();
    } catch (err: any) {
      console.error('Error updating tool directly:', err);
      toast.error('فشل حفظ التعديل: ' + err.message);
    } finally {
      setIsSavingDirectEdit(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 selection:bg-[#beff50] selection:text-[#14140f]" dir="rtl">
        
        {/* ========================================================= */}
        {/* HEADER SECTION                                            */}
        {/* ========================================================= */}
        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-[0.05em] bg-[#f5f5eb] text-[#14140f] border border-[#d2d2c8]">
            <span className="w-2 h-2 rounded-full bg-[#beff50] border border-[#14140f] shrink-0" />
            <span>نظام إدارة ورفع وتعديل الأدوات الذكي (TOLZY Engine)</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#14140f]">
                إدارة ورفع وتحديث الأدوات
              </h1>
              <p className="text-xs sm:text-base text-[#6e6e64] max-w-2xl font-normal leading-relaxed mt-1">
                نظام ذكي للتعرف على الأدوات وتحديث بياناتها القائمة تلقائياً، أو إضافة الجديد منها بدون أي تكرار.
              </p>
            </div>

            {/* Total Tools in Database Counter */}
            <div className="flex items-center gap-3 bg-[#f5f5eb] border border-[#d2d2c8] px-4 py-2.5 rounded-2xl shrink-0 self-start sm:self-auto">
              <Layers className="w-4 h-4 text-[#14140f]" />
              <div className="text-right">
                <span className="text-[10px] text-[#6e6e64] block">الأدوات في القاعدة:</span>
                <span className="text-sm font-mono font-bold text-[#14140f]">
                  {isLoadingDbTools ? 'جاري التحميل...' : `${dbTools.length} أداة`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* NAVIGATION TABS (50/50 Segmented Control)                 */}
        {/* ========================================================= */}
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8]">
            <button
              onClick={() => setActiveTab('smart_upload')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'smart_upload'
                  ? 'bg-[#beff50] text-[#14140f] border border-[#14140f]/20 shadow-sm'
                  : 'text-[#6e6e64] hover:text-[#14140f]'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>الرفع والتعرف الذكي بالملفات</span>
            </button>

            <button
              onClick={() => setActiveTab('direct_editor')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'direct_editor'
                  ? 'bg-[#beff50] text-[#14140f] border border-[#14140f]/20 shadow-sm'
                  : 'text-[#6e6e64] hover:text-[#14140f]'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>البحث والتعديل المباشر</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SMART BULK UPLOAD & RECOGNITION                    */}
        {/* ========================================================= */}
        {activeTab === 'smart_upload' && (
          <div className="space-y-6">
            {/* Quick Templates Download Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={downloadExcelTemplate}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#f5f5eb] hover:bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] transition-all cursor-pointer text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#14140f]">تحميل قالب Excel الذكي (.xlsx)</h4>
                    <p className="text-[11px] text-[#6e6e64]">ملف مجهز بالكامل بالأعمدة ومثال أداة لتعبئته</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-[#6e6e64] group-hover:text-[#14140f] transition-colors" />
              </button>

              <a
                href="/tools-example-with-subcategories.json"
                download
                className="flex items-center justify-between p-4 rounded-2xl bg-[#f5f5eb] hover:bg-[#ffffff] border border-[#d2d2c8] hover:border-[#14140f] transition-all cursor-pointer text-right group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffffff] border border-[#d2d2c8] flex items-center justify-center text-[#14140f] shrink-0">
                    <FileJson className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#14140f]">تحميل نموذج JSON (.json)</h4>
                    <p className="text-[11px] text-[#6e6e64]">هيكل بيانات قياسي للأدوات مع الفئات والوسوم</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-[#6e6e64] group-hover:text-[#14140f] transition-colors" />
              </a>
            </div>

            {/* Dropzone Container */}
            <div className="relative p-6 sm:p-10 rounded-2xl sm:rounded-[28px] border-2 border-dashed border-[#d2d2c8] hover:border-[#14140f] bg-[#ffffff] text-center transition-all">
              <input
                type="file"
                accept=".json,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />

              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] flex items-center justify-center mx-auto text-[#14140f]">
                  <Upload className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#14140f]">
                    اختر أو اسحب ملف الأدوات الجديد (JSON أو Excel)
                  </h3>
                  <p className="text-xs text-[#6e6e64]">
                    يدعم الملفات بصيغة JSON (.json) أو Excel (.xlsx, .xls) للتعرف الفوري على الأدوات.
                  </p>
                </div>

                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>تحديد ملف من جهازك</span>
                </label>

                {file && (
                  <div className="mt-3 p-3 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] text-xs text-[#14140f] flex items-center justify-between">
                    <span className="font-medium truncate">{file.name}</span>
                    <span className="text-[10px] text-[#6e6e64] font-mono shrink-0 mr-2">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PRE-UPLOAD ANALYSIS & RECOGNITION REPORT */}
            {isAnalyzing && (
              <div className="p-8 rounded-2xl bg-[#f5f5eb] border border-[#d2d2c8] text-center space-y-3">
                <div className="w-8 h-8 border-2 border-[#14140f] border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-[#14140f]">جاري فحص ومطابقة الأدوات مع قاعدة البيانات...</h4>
                <p className="text-xs text-[#6e6e64]">نتحقق من الأدوات القائمة لمنع التكرار واكتشاف التعديلات الجديدة.</p>
              </div>
            )}

            {analyzedTools && analysisStats && !isAnalyzing && (
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-[28px] bg-[#f5f5eb] border border-[#d2d2c8] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d2d2c8] pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#14140f] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#14140f]" />
                      <span>تقرير فحص ومطابقة الملف المرفوع</span>
                    </h3>
                    <p className="text-xs text-[#6e6e64]">
                      تم العثور على {analysisStats.total} أداة داخل الملف. راجع التحليل أدناه قبل بدء المعالجة:
                    </p>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full bg-[#ffffff] border border-[#d2d2c8] font-mono font-medium self-start sm:self-auto">
                    {analysisStats.total} أداة بالإجمالي
                  </span>
                </div>

                {/* Metrics Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Recognized Tools to Update */}
                  <div className="p-4 rounded-xl bg-[#ffffff] border border-amber-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-amber-800">أدوات تم التعرف عليها مسبقاً</span>
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-amber-900">
                      {analysisStats.recognized}
                    </div>
                    <p className="text-[10px] text-amber-700 mt-1">
                      موجودة في قاعدة البيانات وستتم مراجعتها وتحديث حقولها الجديدة.
                    </p>
                  </div>

                  {/* Brand New Tools */}
                  <div className="p-4 rounded-xl bg-[#ffffff] border border-emerald-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-emerald-800">أدوات جديدة كلياً</span>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-900">
                      {analysisStats.brandNew}
                    </div>
                    <p className="text-[10px] text-emerald-700 mt-1">
                      غير مسجلة سابقاً وسيتم إضافتها إلى الدليل كأدوات جديدة.
                    </p>
                  </div>

                  {/* Invalid Tools */}
                  <div className="p-4 rounded-xl bg-[#ffffff] border border-rose-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-rose-800">أدوات بها أخطاء بيانات</span>
                      <XCircle className="w-4 h-4 text-rose-600" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-rose-900">
                      {analysisStats.invalid}
                    </div>
                    <p className="text-[10px] text-rose-700 mt-1">
                      تنقصها حقول إلزامية كاسم الأداة أو الرابط.
                    </p>
                  </div>
                </div>

                {/* Upload Strategy Mode Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[#14140f] block">
                    اختر خطة واستراتيجية الرفع المطلوبة:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMode('upsert')}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        uploadMode === 'upsert'
                          ? 'bg-[#beff50] border-[#14140f] text-[#14140f] font-medium'
                          : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f]'
                      }`}
                    >
                      <div className="text-xs font-bold">1. الوضع الذكي (Smart Upsert) ⭐</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        تحديث الأدوات القائمة وتعديلها + إضافة الأدوات الجديدة كلياً.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadMode('update_only')}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        uploadMode === 'update_only'
                          ? 'bg-[#beff50] border-[#14140f] text-[#14140f] font-medium'
                          : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f]'
                      }`}
                    >
                      <div className="text-xs font-bold">2. تعديل القائم فقط (Update Only)</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        تعديل الأدوات المطابقة فقط وتخطي أي أداة جديدة.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadMode('insert_only')}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                        uploadMode === 'insert_only'
                          ? 'bg-[#beff50] border-[#14140f] text-[#14140f] font-medium'
                          : 'bg-[#ffffff] border-[#d2d2c8] text-[#6e6e64] hover:text-[#14140f]'
                      }`}
                    >
                      <div className="text-xs font-bold">3. إضافة الجديد وتخطي القائم</div>
                      <div className="text-[10px] opacity-80 mt-0.5">
                        السلوك الكلاسيكي لمن يريد فقط إضافة الجديد وتجاهل المكرر.
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sample Preview of Recognized Tools with Diff */}
                {analysisStats.recognized > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#14140f] block">
                      عينات من الأدوات التي تم التعرف عليها وسيتم تعديلها:
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-[#ffffff] border border-[#d2d2c8]">
                      {analyzedTools
                        .filter((t) => t.isRecognized)
                        .slice(0, 10)
                        .map((t, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-[#f5f5eb] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                          >
                            <span className="font-bold text-[#14140f]">{t.tool.name}</span>
                            <span className="text-[10px] text-amber-800">
                              {t.diffSummary?.slice(0, 2).join(' • ')}
                            </span>
                          </div>
                        ))}
                      {analysisStats.recognized > 10 && (
                        <p className="text-[10px] text-center text-[#6e6e64] py-1">
                          و {analysisStats.recognized - 10} أداة أخرى سيتم تحديثها تلقائياً...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  onClick={handleExecuteUpload}
                  disabled={uploading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#14140f] hover:bg-[#30302a] text-[#ffffff] font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                  <span>
                    {uploading
                      ? 'جاري تطبيق التعديلات ورفع الأدوات...'
                      : `بدء تنفيذ الرفع والتحديث (${analysisStats.total} أداة)`}
                  </span>
                </button>
              </div>
            )}

            {/* PROGRESS BAR VIEW */}
            {uploading && (
              <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#d2d2c8] space-y-4">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-[#14140f]">جاري معالجة وتحديث الأدوات...</span>
                  <span className="font-mono font-bold text-[#14140f]">{progress}%</span>
                </div>

                <div className="w-full bg-[#f5f5eb] border border-[#d2d2c8] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#beff50] h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#6e6e64]">
                  <span>تمت معالجة: {processedCount} / {analyzedTools?.length}</span>
                  {currentProcessingName && (
                    <span className="text-[#14140f] font-medium truncate max-w-[200px]">
                      الأداة الحالية: {currentProcessingName}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* FINAL RESULTS VIEW */}
            {finalResults && (
              <div className="p-6 rounded-2xl bg-[#ffffff] border border-[#d2d2c8] space-y-5">
                <div className="flex items-center gap-2 border-b border-[#d2d2c8] pb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-[#14140f]">تقرير نتائج المعالجة والرفع النهائية</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <div className="text-xl font-bold font-mono text-emerald-900">{finalResults.inserted}</div>
                    <div className="text-[11px] text-emerald-700">أدوات أُضيفت حديثاً</div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <div className="text-xl font-bold font-mono text-amber-900">{finalResults.updated}</div>
                    <div className="text-[11px] text-amber-700">أدوات تم التعرف عليها وتحديثها</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] text-center">
                    <div className="text-xl font-bold font-mono text-[#6e6e64]">{finalResults.skipped}</div>
                    <div className="text-[11px] text-[#6e6e64]">أدوات متخطاة</div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                    <div className="text-xl font-bold font-mono text-rose-900">{finalResults.failed}</div>
                    <div className="text-[11px] text-rose-700">فشل في المعالجة</div>
                  </div>
                </div>

                {/* Updated Tools List Preview */}
                {finalResults.updatedList.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-amber-900">الأدوات التي تم تحديثها بنجاح:</h4>
                    <div className="max-h-40 overflow-y-auto p-2.5 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] space-y-1">
                      {finalResults.updatedList.map((item, idx) => (
                        <p key={idx} className="text-[11px] text-[#14140f]">
                          • {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LIVE DIRECT TOOL SEARCH & IN-PLACE EDITOR          */}
        {/* ========================================================= */}
        {activeTab === 'direct_editor' && (
          <div className="space-y-6">
            {/* Search Tool to Edit */}
            <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#d2d2c8] space-y-3">
              <label className="text-xs font-bold text-[#14140f] block">
                ابحث عن أي أداة في قاعدة البيانات لتعديلها مباشرة:
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-[#6e6e64] absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، الفئة، أو الرابط (مثال: ChatGPT, Midjourney, Cursor)..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] text-xs sm:text-sm focus:outline-none"
                />
              </div>

              {/* Matching Tools Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                {filteredSearchTools.map((t) => {
                  const isSelected = selectedToolToEdit?.id === t.id;
                  const cat = Array.isArray(t.category) ? t.category[0] : t.category;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedToolToEdit(t)}
                      className={`p-2.5 rounded-xl border text-right flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#beff50] border-[#14140f] shadow-sm'
                          : 'bg-[#ffffff] hover:bg-[#f5f5eb] border-[#d2d2c8]'
                      }`}
                    >
                      <ToolImage name={t.name} categoryName={cat} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#14140f] truncate">{t.name}</div>
                        <div className="text-[10px] text-[#6e6e64] truncate">{cat} • {t.pricing}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Tool In-Place Editor Form */}
            {selectedToolToEdit && (
              <div className="p-6 rounded-2xl sm:rounded-[28px] bg-[#ffffff] border border-[#14140f] space-y-5">
                <div className="flex items-center justify-between border-b border-[#d2d2c8] pb-4">
                  <div className="flex items-center gap-3">
                    <ToolImage
                      name={selectedToolToEdit.name}
                      categoryName={Array.isArray(selectedToolToEdit.category) ? selectedToolToEdit.category[0] : selectedToolToEdit.category}
                      size="md"
                    />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#14140f]">
                        تعديل أداة: {selectedToolToEdit.name}
                      </h3>
                      <span className="text-[11px] text-[#6e6e64] font-mono">
                        معرف الأداة (ID): {selectedToolToEdit.id}
                      </span>
                    </div>
                  </div>

                  <a
                    href={selectedToolToEdit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f5eb] hover:bg-[#beff50] text-[#14140f] border border-[#d2d2c8] text-xs font-medium transition-colors"
                  >
                    <span>زيارة الرابط</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#14140f]">اسم الأداة:</label>
                    <input
                      type="text"
                      value={selectedToolToEdit.name}
                      onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    />
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#14140f]">نموذج التسعير:</label>
                    <select
                      value={selectedToolToEdit.pricing}
                      onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, pricing: e.target.value as ToolPricing })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    >
                      <option value="Free">Free (مجاني)</option>
                      <option value="Freemium">Freemium (مزيج مجاني/مدفوع)</option>
                      <option value="Paid">Paid (مدفوع)</option>
                      <option value="Subscription">Subscription (اشتراك دوري)</option>
                    </select>
                  </div>

                  {/* Official URL */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#14140f]">رابط الموقع الرسمي:</label>
                    <input
                      type="text"
                      value={selectedToolToEdit.url}
                      onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    />
                  </div>

                  {/* Rating */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#14140f]">التقييم (0 إلى 5):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={selectedToolToEdit.rating || 4.5}
                      onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, rating: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-[#14140f]">الوصف المختصر:</label>
                    <textarea
                      rows={2}
                      value={selectedToolToEdit.description}
                      onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    />
                  </div>

                  {/* Long Description */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-[#14140f]">الوصف التفصيلي والمراجعة:</label>
                    <textarea
                      rows={3}
                      value={selectedToolToEdit.longDescription || selectedToolToEdit.description}
                      onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, longDescription: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    />
                  </div>

                  {/* Features (Pipe separated) */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold text-[#14140f]">المميزات والوظائف (افصل بين كل ميزة بـ |):</label>
                    <input
                      type="text"
                      value={Array.isArray(selectedToolToEdit.features) ? selectedToolToEdit.features.join(' | ') : selectedToolToEdit.features}
                      onChange={(e) => setSelectedToolToEdit({ 
                        ...selectedToolToEdit, 
                        features: e.target.value.split('|').map(s => s.trim()).filter(Boolean) 
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    />
                  </div>

                  {/* Pros & Cons */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#14140f]">الإيجابيات (افصل بـ |):</label>
                    <input
                      type="text"
                      value={Array.isArray(selectedToolToEdit.pros) ? selectedToolToEdit.pros.join(' | ') : (selectedToolToEdit.pros || '')}
                      onChange={(e) => setSelectedToolToEdit({ 
                        ...selectedToolToEdit, 
                        pros: e.target.value.split('|').map(s => s.trim()).filter(Boolean) 
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#14140f]">السلبيات (افصل بـ |):</label>
                    <input
                      type="text"
                      value={Array.isArray(selectedToolToEdit.cons) ? selectedToolToEdit.cons.join(' | ') : (selectedToolToEdit.cons || '')}
                      onChange={(e) => setSelectedToolToEdit({ 
                        ...selectedToolToEdit, 
                        cons: e.target.value.split('|').map(s => s.trim()).filter(Boolean) 
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-[#f5f5eb] border border-[#d2d2c8] focus:border-[#14140f] focus:outline-none"
                    />
                  </div>

                  {/* Checkbox Flags */}
                  <div className="flex items-center gap-4 pt-2 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedToolToEdit.isFeatured || false}
                        onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, isFeatured: e.target.checked })}
                        className="rounded accent-[#14140f]"
                      />
                      <span className="font-bold text-[#14140f]">أداة مميزة (Featured)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedToolToEdit.isPopular || false}
                        onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, isPopular: e.target.checked })}
                        className="rounded accent-[#14140f]"
                      />
                      <span className="font-bold text-[#14140f]">أداة شائعة (Popular)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedToolToEdit.isNew || false}
                        onChange={(e) => setSelectedToolToEdit({ ...selectedToolToEdit, isNew: e.target.checked })}
                        className="rounded accent-[#14140f]"
                      />
                      <span className="font-bold text-[#14140f]">أداة جديدة (New)</span>
                    </label>
                  </div>
                </div>

                {/* Save Changes Button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#d2d2c8]">
                  <button
                    onClick={() => {
                      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedToolToEdit, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute('href', dataStr);
                      downloadAnchor.setAttribute('download', `${selectedToolToEdit.name.toLowerCase()}-tool.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#f5f5eb] hover:bg-[#e8e8dc] text-[#14140f] text-xs font-medium transition-colors"
                  >
                    تصدير كـ JSON
                  </button>

                  <button
                    onClick={handleSaveDirectEdit}
                    disabled={isSavingDirectEdit}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#beff50] hover:bg-[#abf03c] text-[#14140f] border border-[#14140f] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingDirectEdit ? 'جاري الحفظ...' : 'حفظ التعديلات في قاعدة البيانات فوراً'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </PageLayout>
  );
}
