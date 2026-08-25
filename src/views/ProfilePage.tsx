"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTools } from '../hooks/useTools';
import { useUserData } from '../hooks/useUserData';
import { getUsersSavedTools, getUsersSubmittedTools } from '../services/tools.service';
import Link from 'next/link';
import PageLayout from '../components/layout/PageLayout';
import SavedTools from '../components/tools/SavedTools';
import { updateProfile } from 'firebase/auth';
import { 
  User, Camera, Loader, Mail, Calendar, Shield, Settings, 
  Edit2, Check, X, Award, Heart, Bookmark, Activity, 
  Upload, BookOpen, FileText, Zap, ChevronRight, LogOut, Bell, Lock, Phone, MapPin, Globe, AlertCircle, MessageSquare,
  Crown, Gauge, ArrowUpRight
} from 'lucide-react';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
// supabase client not needed here — uploads go through /api/user/upload-avatar

interface ViewedUser {
  uid: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL: string | null;
  coverURL: string | null;
  email: string;
  createdAt: string;
  role: string;
  plan: string;
}

const ProfilePage: React.FC = () => {
  const searchParams = useSearchParams();
  const profileUsername = searchParams.get('username')?.trim().toLowerCase();

  const { user, userProfile } = useAuth();
  const { userData } = useUserData();
  const { tools: globalTools } = useTools();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [viewedUser, setViewedUser] = useState<ViewedUser | null>(null);
  const [viewedLoading, setViewedLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<any>(null);

  // Determine if viewing own profile or someone else's
  const isOwnProfile = !profileUsername || (viewedUser?.uid === user?.uid) || (userData?.displayName && profileUsername === userData.displayName.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));
  const activeUser = viewedUser || {
    uid: user?.uid || '',
    username: '',
    displayName: userData?.displayName || user?.displayName || 'مستخدم',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    photoURL: user?.photoURL || userData?.photoURL || null,
    coverURL: userData?.coverURL || null,
    email: user?.email || '',
    createdAt: userData?.createdAt || '',
    role: userData?.role || 'user',
    plan: userProfile?.plan || 'free',
  };

  // Fetch real token usage for the active user
  useEffect(() => {
    const fetchUsage = async () => {
      const targetUid = activeUser.uid;
      if (!targetUid) return;
      try {
        const res = await fetch(`/api/user/token-usage?userId=${targetUid}`);
        if (res.ok) {
          const data = await res.json();
          setTokenUsage(data);
        }
      } catch (err) {
        console.error('Failed to fetch user token usage on profile:', err);
      }
    };
    fetchUsage();
  }, [activeUser.uid]);

  const rawPlan = tokenUsage?.plan || String(viewedUser?.plan || userProfile?.plan || 'free').toLowerCase();
  const isMaxPlan = rawPlan.includes('max') || rawPlan.includes('ultra');
  const isProPlan = !isMaxPlan && (rawPlan.includes('pro') || rawPlan.includes('plus'));
  const isAdminPlan = rawPlan === 'admin' || (isOwnProfile && (userData?.role === 'admin' || user?.email?.toLowerCase() === 'mahmoud.m.moussa5310@gmail.com'));

  // Check admin privileges (only for own profile)
  const isAdmin = isOwnProfile && (userData?.role === 'admin' || user?.email?.toLowerCase() === 'mahmoud.m.moussa5310@gmail.com');

  // Fetch viewed user profile when username is in URL
  useEffect(() => {
    if (!profileUsername) {
      setViewedUser(null);
      return;
    }
    const fetchViewedUser = async () => {
      setViewedLoading(true);
      try {
        const res = await fetch(`/api/community/user-profile?username=${encodeURIComponent(profileUsername)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setViewedUser(data);
        } else {
          setViewedUser(null);
          setError('المستخدم غير موجود');
        }
      } catch (e) {
        setViewedUser(null);
        setError('فشل تحميل الملف الشخصي');
      } finally {
        setViewedLoading(false);
      }
    };
    fetchViewedUser();
  }, [profileUsername]);

  // Fetch community posts when viewing another user's profile
  useEffect(() => {
    if (!profileUsername || isOwnProfile) {
      setUserPosts([]);
      return;
    }
    const fetchPosts = async () => {
      setLoadingUserPosts(true);
      try {
        const res = await fetch(`/api/community/user-posts?username=${encodeURIComponent(profileUsername)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUserPosts(data.posts || []);
        } else {
          setUserPosts([]);
        }
      } catch (e) {
        setUserPosts([]);
      } finally {
        setLoadingUserPosts(false);
      }
    };
    fetchPosts();
  }, [profileUsername, isOwnProfile]);

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setCoverURL(userData.coverURL || null);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [userData, user]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const [savedTools, setSavedTools] = useState<any[]>([]);
  const [addedTools, setAddedTools] = useState<any[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [coverURL, setCoverURL] = useState<string | null>(userData?.coverURL || null);

  // ... (edit state) ...

  const compressImage = (file: File, maxSize = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });
              resolve(newFile);
            } else reject(new Error('Compression failed'));
          }, 'image/webp', quality);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Fetch tools directly for reliability
  useEffect(() => {
    const fetchUserTools = async () => {
      if (!user?.uid) return;
      setIsLoadingTools(true);
      try {
        // إلغاء جلب الأدوات المحفوظة نهائياً للمسؤول لتسريع التحميل وتجنب المشاكل
        const [saved, submitted] = await Promise.all([
          isAdmin ? Promise.resolve([]) : getUsersSavedTools(user.uid),
          getUsersSubmittedTools(user.uid)
        ]);
        setSavedTools(saved);
        setAddedTools(submitted);
      } catch (err) {
        console.error('Error fetching user tools:', err);
      } finally {
        setIsLoadingTools(false);
      }
    };

    fetchUserTools();
  }, [user?.uid, isAdmin]);

  // Keep savedTools synced with global context updates for optimistic UI (optional/hybrid)
  useEffect(() => {
    if (user?.uid && globalTools.length > 0) {
      // This can be used to update live status if needed, but the main fetch above ensures we have ALL of them initially.
      // We can re-run the fetch if we want strict sync or just rely on local state updates if we implemented them.
      // For now, let's stick to the initial fetch to solve the "missing tools" bug.
    }
  }, [globalTools, user?.uid]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // ⛔ Security: only the owner can upload their own photo
    if (!file || !user) return;
    if (!isOwnProfile) {
      setError('ليس لديك صلاحية تعديل ملف هذا المستخدم');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 10 ميجابايت');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار صورة صالحة');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress(10);

      const compressed = await compressImage(file);
      setUploadProgress(30);

      // ✔️ Secure upload via server-side API (token verified on server)
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('type', 'avatar');

      setUploadProgress(50);

      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'فشل الرفع');
      }

      const { publicUrl } = await res.json();
      setUploadProgress(80);

      await updateProfile(auth.currentUser!, { photoURL: publicUrl });

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: publicUrl,
        updatedAt: new Date().toISOString()
      });

      setUploadProgress(100);
      setSuccess('تم تحديث الصورة الشخصية بنجاح!');
      setTimeout(() => window.location.reload(), 1000);

    } catch (err: any) {
      console.error('❌ Upload Error:', err);
      setError('فشل رفع الصورة: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // ⛔ Security: only the owner can upload their own cover
    if (!file || !user) return;
    if (!isOwnProfile) {
      setError('ليس لديك صلاحية تعديل ملف هذا المستخدم');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('حجم صورة الغلاف يجب أن يكون أقل من 10 ميجابايت');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار صورة صالحة');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setUploadProgress(10);

      const compressed = await compressImage(file, 1600, 0.8);
      setUploadProgress(30);

      // ✔️ Secure upload via server-side API (token verified on server)
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('type', 'cover');

      setUploadProgress(50);

      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'فشل الرفع');
      }

      const { publicUrl } = await res.json();
      setUploadProgress(80);

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        coverURL: publicUrl,
        updatedAt: new Date().toISOString()
      });

      setCoverURL(publicUrl);
      setUploadProgress(100);
      setSuccess('تم تحديث صورة الغلاف بنجاح!');
      setTimeout(() => window.location.reload(), 1000);

    } catch (err: any) {
      console.error('❌ Cover Upload Error:', err);
      setError('فشل رفع صورة الغلاف: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ⛔ Security: only the owner can submit profile changes
    if (!user) return;
    if (!isOwnProfile) {
      setError('ليس لديك صلاحية تعديل ملف هذا المستخدم');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('يرجى إدخال الاسم الأول والأخير');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const newDisplayName = `${firstName.trim()} ${lastName.trim()}`;
      await updateProfile(auth.currentUser!, {
        displayName: newDisplayName
      });

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: newDisplayName,
        updatedAt: new Date().toISOString()
      });

      setSuccess('تم تحديث الملف الشخصي بنجاح!');
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error('Update Error:', err);
      setError('حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwnProfile && viewedLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-20">
          <Loader className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">

        {/* Messages */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in-down text-sm sm:text-base">
            <Check className="w-5 h-5 shrink-0" />
            <p className="font-bold">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in-down text-sm sm:text-base">
            <X className="w-5 h-5 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Central Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm sm:shadow-xl text-center flex flex-col items-center relative overflow-hidden">
          {/* Cover Photo */}
          <div className="relative w-full h-40 sm:h-52 group">
            {(activeUser.coverURL || coverURL || userData?.coverURL) ? (
              <img
                src={activeUser.coverURL || coverURL || userData?.coverURL || ''}
                alt="Cover"
                className="w-full h-full object-cover rounded-t-[2rem]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-t-[2rem] flex items-center justify-center">
                <div className="text-white/30 font-black text-4xl sm:text-5xl tracking-widest">TOLZY</div>
              </div>
            )}

            {/* Cover Upload Overlay — only for own profile */}
            {isOwnProfile && (
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer text-white rounded-t-[2rem]">
                <Camera className="w-7 h-7 mb-1.5" />
                <span className="text-xs font-bold">تغيير الغلاف</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isLoading} />
              </label>
            )}

            {uploadProgress > 0 && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 rounded-t-[2rem]">
                <Loader className="w-6 h-6 text-white animate-spin mb-1" />
                <span className="text-white text-[10px] font-bold">{uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Profile Picture */}
          <div className="relative group -mt-14 sm:-mt-16 mb-4 z-10">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg border-4 border-white dark:border-slate-800 relative">
              {activeUser.photoURL ? (
                <img src={activeUser.photoURL} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              )}

              {/* Upload Overlay — only for own profile */}
              {isOwnProfile && (
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer text-white">
                  <Camera className="w-6 h-6 mb-1.5" />
                  <span className="text-[10px] sm:text-xs font-bold">تغيير الصورة</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
                </label>
              )}

              {uploadProgress > 0 && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
                  <Loader className="w-6 h-6 text-white animate-spin mb-1" />
                  <span className="text-white text-[10px] font-bold">{uploadProgress}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-10 sm:pb-10 w-full">

          {/* Basic Info */}
          <div className="z-10 w-full">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2 mb-3">
              {activeUser.displayName}
              {activeUser.role === 'admin' && <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500/20" />}
            </h1>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mb-8">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700/50">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span className="truncate max-w-[200px] sm:max-w-none">{activeUser.email || 'غير متوفر'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700/50">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>عضو منذ {activeUser.createdAt ? new Date(activeUser.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-1.5 rounded-full border border-slate-100 dark:border-slate-700/50">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold">
                  الخطة: {
                    isAdminPlan ? 'حساب الإدارة (Admin 👑)' :
                    isMaxPlan ? 'خطة الاستوديو (MAX 2.5M) 👑' :
                    isProPlan ? 'الخطة الاحترافية (Pro 500K) ⭐' :
                    'الخطة المجانية (Free 10K)'
                  }
                </span>
              </div>
            </div>

            {/* Real Token Usage Box */}
            {isOwnProfile && tokenUsage && (
              <div className="mb-8 max-w-xl mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-right space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">رصيد واستخدام التوكن الحقيقي (AI Tokens)</h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    {tokenUsage.percentageUsed || 0}% مستهلك
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      (tokenUsage.percentageUsed || 0) >= 90 ? 'bg-rose-500' :
                      (tokenUsage.percentageUsed || 0) >= 75 ? 'bg-amber-500' : 'bg-blue-600'
                    } transition-all duration-500 rounded-full`}
                    style={{ width: `${tokenUsage.percentageUsed || 0}%` }}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1 text-center">
                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">المستهلك</span>
                    <span className="font-bold text-slate-900 dark:text-white">{(tokenUsage.tokensUsed || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">المتبقي</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{(tokenUsage.tokensRemaining || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">إجمالي الباقة</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{(tokenUsage.tokenAllowance || 0).toLocaleString()}</span>
                  </div>
                </div>

                {!isAdminPlan && (
                  <div className="pt-1 text-left">
                    <Link 
                      href="/pricing"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>ترقية الباقة أو زيادة الرصيد</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center justify-center gap-3">

              {isOwnProfile && (
              <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center justify-center gap-2 w-full sm:w-auto mx-auto px-6 py-2.5 sm:py-3 rounded-xl transition-all font-bold text-sm sm:text-base ${
                  isEditing 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 dark:shadow-white/10'
                }`}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? 'إلغاء التعديل' : 'تعديل الملف الشخصي'}
              </button>

              <button
                onClick={async () => {
                   const { signOut } = await import('firebase/auth');
                   await signOut(auth);
                   window.location.href = '/';
                }}
                className="flex md:hidden items-center justify-center gap-2 w-full mx-auto px-6 py-2.5 sm:py-3 rounded-xl transition-all font-bold text-sm sm:text-base bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
              >
                <LogOut className="w-4 h-4 rtl:-scale-x-100" />
                تسجيل الخروج
              </button>
              </>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Edit Form */}
        {isOwnProfile && isEditing && (
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 animate-fade-in-up shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">تحديث البيانات</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">الاسم الأول</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">الاسم الأخير</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني (غير قابل للتعديل)</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={email}
                    disabled
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-transparent cursor-not-allowed text-sm text-slate-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm sm:text-base font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </form>
          </div>
        )}

        {/* Stats Grid */}
        {isOwnProfile && (
        <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-3 sm:gap-4`}>
          {!isAdmin && (
            <>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] flex flex-col items-center justify-center text-center group shadow-sm transition-all hover:border-indigo-500/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 sm:mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-0.5">{savedTools.length}</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">المكتبة</p>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] flex flex-col items-center justify-center text-center group shadow-sm transition-all hover:border-rose-500/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2 sm:mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-0.5">
                  {savedTools.filter(t => t.isFeatured).length}
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">المفضلة</p>
              </div>
            </>
          )}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] flex flex-col items-center justify-center text-center group shadow-sm transition-all hover:border-amber-500/30">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2 sm:mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-0.5">{addedTools.length}</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">المضافة</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] flex flex-col items-center justify-center text-center group shadow-sm transition-all hover:border-emerald-500/30">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 sm:mb-3 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-sm sm:text-base font-black text-emerald-500 mb-0.5 mt-2sm:mt-0 pt-1">نشط</p>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">الحالة</p>
          </div>
        </div>
        )}

        {/* Admin Section */}
        {isOwnProfile && isAdmin && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8">
            {[
              { title: 'رفع الأدوات', icon: Upload, href: '/admin/upload-tools', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', hover: 'hover:border-blue-500/30' },
              { title: 'المحتوى', icon: BookOpen, href: '/admin/courses', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', hover: 'hover:border-purple-500/30' },
              { title: 'الأخبار', icon: FileText, href: '/admin/courses?tab=news', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20', hover: 'hover:border-pink-500/30' },
              { title: 'اللوحة', icon: Shield, href: '/admin', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', hover: 'hover:border-orange-500/30' },
            ].map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href} 
                className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm transition-all ${item.hover}`}
              >
                <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">{item.title}</h3>
              </Link>
            ))}
          </div>
        )}

        {/* Added Tools List */}
        {isOwnProfile && addedTools.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">أدواتي المضافة</h3>
            </div>
            {isLoadingTools ? (
              <div className="flex justify-center py-12">
                <Link href="/learn" className="text-emerald-500 hover:text-emerald-600 transition-colors">🚀 ابدأ التعلم الآن</Link>
              </div>
            ) : (
              <SavedTools tools={addedTools} />
            )}
          </div>
        )}

        {/* Saved Tools List */}
        {isOwnProfile && !isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">مكتبتي</h3>
          </div>
          {isLoadingTools ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
             <SavedTools tools={savedTools} />
          )}
        </div>
        )}

        {/* Community Posts for Other Users */}
        {!isOwnProfile && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">منشورات المجتمع</h3>
            </div>
            {loadingUserPosts ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-10 text-slate-500 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                لا توجد منشورات عامة بعد
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post: any) => (
                  <div key={post.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-white">{post.author_name}</span>
                        <span className="text-xs text-slate-400">@{post.author_username || activeUser.username}</span>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{post.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-wrap">{post.prompt_text || post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.map((tag: string) => (
                          <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </PageLayout>
  );
};

export default ProfilePage;
