"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { getUsersSavedTools, getUsersSubmittedTools } from '../services/tools.service';
import PageLayout from '../components/layout/PageLayout';
import SavedTools from '../components/tools/SavedTools';
import { updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import {
  User,
  Camera,
  Loader2,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Check,
  X,
  Bookmark,
  Zap,
  LogOut,
  Upload,
  BookOpen,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

interface ViewedUser {
  uid: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photoURL: string | null;
  coverURL?: string | null;
  email: string;
  createdAt: string;
  role: string;
  plan: string;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileUsername = searchParams.get('username')?.trim().toLowerCase();

  const { user, userProfile, logout } = useAuth();
  const { userData, refreshUserData } = useUserData();

  // Navigation Tabs: 'saved' | 'added' | 'admin' | 'posts'
  const [activeTab, setActiveTab] = useState<'saved' | 'added' | 'admin' | 'posts'>('saved');

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Other User Profile States
  const [viewedUser, setViewedUser] = useState<ViewedUser | null>(null);
  const [viewedLoading, setViewedLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loadingUserPosts, setLoadingUserPosts] = useState(false);

  // Tools Data
  const [savedTools, setSavedTools] = useState<any[]>([]);
  const [addedTools, setAddedTools] = useState<any[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);

  // Determine if viewing own profile or someone else's
  const isOwnProfile =
    !profileUsername ||
    viewedUser?.uid === user?.uid ||
    (userData?.displayName &&
      profileUsername ===
        userData.displayName.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, ''));

  const activeUser = viewedUser || {
    uid: user?.uid || '',
    username: profileUsername || '',
    displayName: userData?.displayName || user?.displayName || 'المستخدم',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    photoURL: user?.photoURL || userData?.photoURL || null,
    email: user?.email || '',
    createdAt: userData?.createdAt || '',
    role: userData?.role || 'user',
    plan: userProfile?.plan || 'free',
  };

  const isAdmin =
    isOwnProfile &&
    (userData?.role === 'admin' ||
      user?.email?.toLowerCase() === 'mahmoud.m.moussa5310@gmail.com');

  // Pre-fill form inputs
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
    } else if (user?.displayName) {
      const parts = user.displayName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [userData, user]);


  // Fetch user tools (Saved & Submitted)
  useEffect(() => {
    const fetchTools = async () => {
      if (!user?.uid || !isOwnProfile) return;
      setIsLoadingTools(true);
      try {
        const [saved, submitted] = await Promise.all([
          isAdmin ? Promise.resolve([]) : getUsersSavedTools(user.uid),
          getUsersSubmittedTools(user.uid),
        ]);
        setSavedTools(saved);
        setAddedTools(submitted);
      } catch (err) {
        console.error('Error fetching tools:', err);
      } finally {
        setIsLoadingTools(false);
      }
    };
    fetchTools();
  }, [user?.uid, isOwnProfile, isAdmin]);

  // Redirect legacy /profile?username=... requests to the dedicated /community/user/[id] route
  useEffect(() => {
    if (profileUsername) {
      router.replace(`/community/user/${encodeURIComponent(profileUsername)}`);
    }
  }, [profileUsername, router]);

  // Fetch community posts when viewing someone else's profile
  useEffect(() => {
    if (!profileUsername || isOwnProfile) return;
    const fetchPosts = async () => {
      setLoadingUserPosts(true);
      try {
        const res = await fetch(
          `/api/community/user-posts?username=${encodeURIComponent(profileUsername)}`,
          { cache: 'no-store' }
        );
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

  // Image compressor helper
  const compressImage = (file: File, maxSize = 800, quality = 0.85): Promise<File> => {
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
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const newFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, '') + '.webp',
                  { type: 'image/webp' }
                );
                resolve(newFile);
              } else reject(new Error('Compression failed'));
            },
            'image/webp',
            quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Instant Avatar Upload (Without Full Page Reload)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !isOwnProfile) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 8 ميجابايت');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const loadingToast = toast.loading('جاري رفع ومعالجة الصورة الشخصية...');

      const compressed = await compressImage(file);
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('type', 'avatar');

      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'فشل رفع الصورة');
      }

      const { publicUrl } = await res.json();

      // Update Firebase Auth & Firestore
      await updateProfile(auth.currentUser!, { photoURL: publicUrl });
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        photoURL: publicUrl,
        updatedAt: new Date().toISOString(),
      });

      toast.dismiss(loadingToast);
      toast.success('تم تحديث الصورة الشخصية بنجاح!');
      if (refreshUserData) refreshUserData();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Profile Information Save (Instant optimistic update)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isOwnProfile) return;

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('يرجى إدخال الاسم الأول واسم العائلة');
      return;
    }

    try {
      setIsSavingProfile(true);
      const newDisplayName = `${firstName.trim()} ${lastName.trim()}`;

      await updateProfile(auth.currentUser!, { displayName: newDisplayName });
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: newDisplayName,
        updatedAt: new Date().toISOString(),
      });

      setIsEditing(false);
      toast.success('تم حفظ التعديلات بنجاح!');
      if (refreshUserData) refreshUserData();
    } catch (err) {
      toast.error('تعذر حفظ البيانات، يرجى المحاولة لاحقاً');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      toast.success('تم تسجيل الخروج');
    } catch (error) {
      await signOut(auth);
      window.location.href = '/';
    }
  };

  const getPlanBadge = () => {
    if (isAdmin) {
      return {
        label: 'مسؤول المنصة 👑',
        className: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900',
      };
    }
    return {
      label: 'عضو المنصة ✨',
      className: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
    };
  };

  const planBadge = getPlanBadge();

  if (!isOwnProfile && viewedLoading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6" dir="rtl">

        {/* ─── Modern Minimal Profile Header ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            {/* Avatar & Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-right">
              
              {/* Avatar with quick upload button */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 ring-2 ring-neutral-200 dark:ring-neutral-700 shadow-md">
                  {activeUser.photoURL ? (
                    <img
                      src={activeUser.photoURL}
                      alt={activeUser.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-3xl font-black">
                      {activeUser.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  {/* Upload overlay */}
                  {isOwnProfile && (
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer text-white text-xs font-bold gap-1">
                      {isUploadingPhoto ? (
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6" />
                          <span>تغيير</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                    {activeUser.displayName}
                  </h1>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${planBadge.className}`}
                  >
                    {planBadge.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                  {activeUser.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-mono">{activeUser.email}</span>
                    </span>
                  )}
                  {activeUser.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>
                        عضو منذ {new Date(activeUser.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            {isOwnProfile && (
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-center">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    isEditing
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 border-transparent shadow-sm'
                  }`}
                >
                  {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                  <span>{isEditing ? 'إغلاق التعديل' : 'تعديل الملف'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </button>
              </div>
            )}
          </div>

          {/* ─── Inline Edit Form (Collapsible, fast) ─── */}
          {isOwnProfile && isEditing && (
            <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleSaveProfile} className="max-w-xl mx-auto space-y-4">
                <div className="text-center md:text-right mb-2">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">تعديل الاسم المعروض</h3>
                  <p className="text-xs text-neutral-400">سيظهر اسمك في المجتمع والتعليقات والملف الشخصي</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">الاسم الأول</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">اسم العائلة</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>حفظ التعديلات</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ─── Fast Navigation Tabs ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold">
          {isOwnProfile ? (
            <>
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'saved'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>المكتبة المحفوظة</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                    {savedTools.length}
                  </span>
                </button>
              )}

              {addedTools.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('added')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'added'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>أدواتي المضافة</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
                    {addedTools.length}
                  </span>
                </button>
              )}


              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'admin'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-black'
                      : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>إدارة النظام</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className="flex items-center gap-2 px-4 py-3 border-b-2 border-blue-600 text-blue-600 font-black"
            >
              <MessageSquare className="w-4 h-4" />
              <span>منشورات المجتمع</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 dark:bg-neutral-800 font-mono">
                {userPosts.length}
              </span>
            </button>
          )}
        </div>

        {/* ─── Tab Content 1: Saved Tools ─── */}
        {isOwnProfile && activeTab === 'saved' && !isAdmin && (
          <div className="space-y-4">
            {isLoadingTools ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <SavedTools tools={savedTools} />
            )}
          </div>
        )}

        {/* ─── Tab Content 2: Submitted Tools ─── */}
        {isOwnProfile && activeTab === 'added' && (
          <div className="space-y-4">
            {isLoadingTools ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <SavedTools tools={addedTools} />
            )}
          </div>
        )}

        {/* ─── Tab Content 4: Admin Shortcuts ─── */}
        {isOwnProfile && isAdmin && activeTab === 'admin' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                title: 'رفع الأدوات',
                desc: 'إضافة ومراجعة أدوات جديدة',
                icon: Upload,
                href: '/admin/upload-tools',
                color: 'text-blue-600 dark:text-blue-400',
              },
              {
                title: 'إدارة الكورسات',
                desc: 'المسارات والمحتوى التعليمي',
                icon: BookOpen,
                href: '/admin/courses',
                color: 'text-purple-600 dark:text-purple-400',
              },
              {
                title: 'إدارة الأدوات',
                desc: 'تعديل وحذف الأدوات الحالية',
                icon: Zap,
                href: '/tools',
                color: 'text-amber-600 dark:text-amber-400',
              },
              {
                title: 'لوحة التحكم العامة',
                desc: 'الإحصائيات والمستخدمين',
                icon: Shield,
                href: '/admin',
                color: 'text-emerald-600 dark:text-emerald-400',
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <ChevronLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition-transform" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ─── Tab Content 5: Community Posts (For public user view) ─── */}
        {!isOwnProfile && activeTab === 'posts' && (
          <div className="space-y-3">
            {loadingUserPosts ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 text-xs">
                لا توجد منشورات عامة لهذا المستخدم بعد.
              </div>
            ) : (
              userPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {post.title}
                    </span>
                    <span className="text-neutral-400 text-[10px]">
                      {new Date(post.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {post.prompt_text || post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </PageLayout>
  );
};

export default ProfilePage;
