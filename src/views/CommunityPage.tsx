"use client";

import React, { useState, useEffect, useCallback } from 'react';
import PageLayout from '../components/layout/PageLayout';
import Link from 'next/link';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Send, 
  Code, 
  Image as ImageIcon, 
  Link as LinkIcon,
  MessageSquare, 
  TrendingUp, 
  Users,
  Share2,
  X,
  Loader2,
  Trash2,
  Edit2,
  Search,
  Globe,
  Heart
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  code_snippet: string | null;
  tags: string[];
  author_uid: string;
  author_name: string;
  author_avatar: string | null;
  votes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  author_uid: string;
  author_name: string;
  created_at: string;
}

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [postCode, setPostCode] = useState('');
  const [postTags, setPostTags] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trendingTags, setTrendingTags] = useState<{ name: string; count: number }[]>([]);
  const [topContributors, setTopContributors] = useState<{ name: string; avatar: string; posts: number }[]>([]);
  
  // Comments state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [activePostIdForMobileComments, setActivePostIdForMobileComments] = useState<string | null>(null);
  const [expandedPostsContent, setExpandedPostsContent] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Edit states
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [editPostCode, setEditPostCode] = useState('');
  const [editPostTags, setEditPostTags] = useState('');
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  // Share sheet state
  const [shareSheetPostId, setShareSheetPostId] = useState<string | null>(null);
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({});

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleExpandContent = (postId: string) => {
    setExpandedPostsContent(prev => {
      const n = new Set(prev);
      if (n.has(postId)) n.delete(postId);
      else n.add(postId);
      return n;
    });
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Media state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Error fetching posts:", error);
        toast.error("حدث خطأ أثناء جلب المنشورات. الرجاء مراجعة الكونسول (F12).");
      } else if (data) {
        setPosts(data);
        computeTrendingTags(data);
        computeTopContributors(data);
      }
    } catch (err) {
      console.error("Unexpected error in fetchPosts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserVotes = useCallback(async () => {
    if (!user?.uid) return;
    
    // Fetch new reactions
    const { data: reactionsData } = await supabase
      .from('post_reactions')
      .select('post_id, reaction_type')
      .eq('user_uid', user.uid);
      
    // Fetch old likes (for backward compatibility)
    const { data: oldVotesData } = await supabase
      .from('post_votes')
      .select('post_id')
      .eq('user_uid', user.uid);

    const reactionsMap: Record<string, string> = {};
    
    // Add old likes first
    if (oldVotesData) {
      oldVotesData.forEach(v => { reactionsMap[v.post_id] = 'like'; });
    }
    
    // Overwrite with new reactions (which have higher priority)
    if (reactionsData) {
      reactionsData.forEach(v => { reactionsMap[v.post_id] = v.reaction_type; });
    }
    
    setUserReactions(reactionsMap);
  }, [user?.uid]);

  const computeTrendingTags = (postsData: Post[]) => {
    const tagCount: Record<string, number> = {};
    postsData.forEach(p => {
      (p.tags || []).forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    const sorted = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
    setTrendingTags(sorted);
  };

  const computeTopContributors = (postsData: Post[]) => {
    const authorCount: Record<string, { name: string; avatar: string; posts: number }> = {};
    postsData.forEach(p => {
      if (!authorCount[p.author_uid]) {
        authorCount[p.author_uid] = {
          name: p.author_name,
          avatar: p.author_avatar || p.author_name[0] || 'م',
          posts: 0,
        };
      }
      authorCount[p.author_uid].posts++;
    });
    const sorted = Object.values(authorCount).sort((a, b) => b.posts - a.posts).slice(0, 5);
    setTopContributors(sorted);
  };

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { fetchUserVotes(); }, [fetchUserVotes]);



  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX_SIZE = 1200;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
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
          }, 'image/webp', 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت)');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCreatePost = async () => {
    if (!user) { toast.error('سجّل دخولك أولاً'); return; }
    if (!postContent.trim() && !imageFile) { toast.error('أضف نصاً أو صورة قبل النشر'); return; }

    setSubmitting(true);
    let finalImageUrl = null;

    if (imageFile) {
      setUploadingImage(true);
      try {
        const compressed = await compressImage(imageFile);
        const fileExt = 'webp';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.uid}/${fileName}`;
        
        let currentBucket = 'community_images';
        let { data: uploadData, error: uploadError } = await supabase.storage
          .from(currentBucket)
          .upload(filePath, compressed);
          
        if (uploadError && uploadError.message.includes("Bucket not found")) {
          currentBucket = 'article-images';
          const retry = await supabase.storage.from(currentBucket).upload(filePath, compressed);
          uploadData = retry.data;
          uploadError = retry.error;
        }

        if (uploadError && uploadError.message.includes("Bucket not found")) {
          currentBucket = 'profile-images';
          const retry = await supabase.storage.from(currentBucket).upload(filePath, compressed);
          uploadData = retry.data;
          uploadError = retry.error;
        }

        if (uploadError) {
          toast.error('حدث خطأ أثناء رفع الصورة');
        } else if (uploadData) {
          const { data } = supabase.storage.from(currentBucket).getPublicUrl(filePath);
          finalImageUrl = data.publicUrl;
        }
      } catch (err) {
        toast.error('فشل في ضغط وتجهيز الصورة');
      }
      setUploadingImage(false);
    }

    const tags = postTags.split(/[,،\s]+/).filter(t => t.trim()).map(t => t.replace('#', '').trim());
    
    let safeContent = postContent.trim();
    if (finalImageUrl) safeContent += `\n\n[IMG::${finalImageUrl}]`;

    const { error } = await supabase.from('community_posts').insert({
      content: safeContent,
      code_snippet: postCode.trim() || null,
      tags,
      author_uid: user.uid,
      author_name: user.displayName || 'مستخدم',
      author_avatar: user.displayName?.[0] || 'م',
    });

    if (error) {
      toast.error('حدث خطأ، حاول مرة أخرى');
    } else {
      toast.success('تم نشر منشورك! 🎉');
      setPostContent('');
      setPostCode('');
      setPostTags('');
      setImageFile(null);
      setImagePreview(null);
      setShowCodeInput(false);
      fetchPosts();
    }
    setSubmitting(false);
  };

  // ─── Notification Helper ───────────────────────────────────────────────
  const sendNotification = async (
    recipientUid: string,
    type: string,
    postId: string,
    postPreview: string
  ) => {
    if (!user || user.uid === recipientUid) return; // don't notify yourself
    const actorName = user.displayName || 'مستخدم';
    
    // 1. Save to Supabase (For UI and Realtime)
    await supabase.from('notifications').insert({
      recipient_uid: recipientUid,
      actor_uid: user.uid,
      actor_name: actorName,
      type,
      post_id: postId,
      post_preview: postPreview.slice(0, 80),
    });

    // 2. Trigger Firebase Push Notification (FCM) securely
    try {
      const idToken = await user.getIdToken();
      fetch('/api/send-fcm', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          recipientUid,
          type,
          postId
        })
      }).catch(err => console.error('Failed to trigger FCM API', err));
    } catch (err) {
      console.error('Error getting auth token:', err);
    }
  };

  const handleVote = async (postId: string, reactionType: string = 'like') => {
    if (!user) { toast.error('سجّل دخولك أولاً للتفاعل'); return; }
    const currentReaction = userReactions[postId];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (currentReaction === reactionType) {
      // Remove reaction
      await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_uid', user.uid);
      await supabase.from('post_votes').delete().eq('post_id', postId).eq('user_uid', user.uid); // Clean up old likes
      await supabase.from('community_posts').update({ votes_count: Math.max(0, post.votes_count - 1) }).eq('id', postId);
      setUserReactions(prev => { const n = { ...prev }; delete n[postId]; return n; });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes_count: Math.max(0, p.votes_count - 1) } : p));
    } else if (currentReaction) {
      // Change reaction (Delete old/migrated, then insert new)
      await supabase.from('post_votes').delete().eq('post_id', postId).eq('user_uid', user.uid);
      await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_uid', user.uid);
      await supabase.from('post_reactions').insert({ post_id: postId, user_uid: user.uid, reaction_type: reactionType });
      
      setUserReactions(prev => ({ ...prev, [postId]: reactionType }));
      // Total count remains the same
      sendNotification(post.author_uid, reactionType, postId, post.content);
    } else {
      // New reaction
      await supabase.from('post_reactions').insert({ post_id: postId, user_uid: user.uid, reaction_type: reactionType });
      await supabase.from('community_posts').update({ votes_count: post.votes_count + 1 }).eq('id', postId);
      setUserReactions(prev => ({ ...prev, [postId]: reactionType }));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, votes_count: p.votes_count + 1 } : p));
      sendNotification(post.author_uid, reactionType, postId, post.content);
    }
  };

  const toggleComments = async (postId: string) => {
    if (isMobile) {
      setActivePostIdForMobileComments(postId);
      setLoadingComments(prev => new Set(prev).add(postId));
      const { data } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (data) {
        setCommentsMap(prev => ({ ...prev, [postId]: data }));
      }
      setLoadingComments(prev => { const n = new Set(prev); n.delete(postId); return n; });
      return;
    }

    const isExpanded = expandedComments.has(postId);
    if (isExpanded) {
      setExpandedComments(prev => { const n = new Set(prev); n.delete(postId); return n; });
      return;
    }

    setLoadingComments(prev => new Set(prev).add(postId));
    const { data } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      setCommentsMap(prev => ({ ...prev, [postId]: data }));
    }
    setExpandedComments(prev => new Set(prev).add(postId));
    setLoadingComments(prev => { const n = new Set(prev); n.delete(postId); return n; });
  };

  // Auto-open comments if accessed from a notification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get('action');
      const targetPostId = searchParams.get('postId');
      
      if (action === 'comment' && targetPostId) {
        // Small delay to ensure posts and UI elements are rendered
        setTimeout(() => {
          toggleComments(targetPostId);
        }, 800);
      }
    }
  }, []);

  const handleAddComment = async (postId: string) => {
    if (!user) { toast.error('سجّل دخولك أولاً'); return; }
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const { data, error } = await supabase.from('post_comments').insert({
      post_id: postId,
      content: text,
      author_uid: user.uid,
      author_name: user.displayName || 'مستخدم',
    }).select().single();

    if (!error && data) {
      setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), data] }));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase.from('community_posts').update({ comments_count: post.comments_count + 1 }).eq('id', postId);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
        // إرسال إشعار لصاحب المنشور
        sendNotification(post.author_uid, 'comment', postId, post.content);
      }
    }
  };

  const handleShare = (postId: string) => {
    setShareSheetPostId(postId);
  };

  const sharePost = async (postId: string, method: 'whatsapp' | 'twitter' | 'telegram' | 'facebook' | 'copy') => {
    const url = `${window.location.origin}/community#post-${postId}`;
    const post = posts.find(p => p.id === postId);
    const text = post ? `✨ ${post.author_name} على منصة TOLZY:\n${post.content.slice(0, 120)}...\n\n${url}` : url;

    // Increment share count in DB
    const newCount = (shareCounts[postId] || post?.shares_count || 0) + 1;
    setShareCounts(prev => ({ ...prev, [postId]: newCount }));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares_count: newCount } : p));
    
    try {
      const { error } = await supabase.rpc('increment_share_count', { p_post_id: postId });
      if (error) {
        // Fallback to manual update if RPC doesn't exist
        await supabase.from('community_posts').update({ shares_count: newCount }).eq('id', postId);
      }
    } catch (err) {
      supabase.from('community_posts').update({ shares_count: newCount }).eq('id', postId);
    }

    if (method === 'copy') {
      await navigator.clipboard.writeText(url);
      toast.success('تم نسخ الرابط! 🔗');
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (method === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else if (method === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post?.content?.slice(0,100) || '')}`, '_blank');
    } else if (method === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
    setShareSheetPostId(null);
  };

  const handleDeletePost = async (postId: string, authorUid: string) => {
    if (!user || user.uid !== authorUid) { toast.error('لا يمكنك حذف هذا المنشور'); return; }
    if (!confirm('هل أنت متأكد من حذف هذا المنشور بجميع تعليقاته؟')) return;

    // Delete associated comments and notifications first to save space and prevent orphans
    await supabase.from('post_comments').delete().eq('post_id', postId);
    await supabase.from('notifications').delete().eq('post_id', postId);

    const { error } = await supabase.from('community_posts').delete().eq('id', postId);
    if (error) {
      toast.error('حدث خطأ أثناء الحذف');
    } else {
      toast.success('تم حذف المنشور وتعليقاته');
      setPosts(prev => {
        const updated = prev.filter(p => p.id !== postId);
        computeTrendingTags(updated);
        computeTopContributors(updated);
        return updated;
      });
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!user) return;
    if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;

    const { error } = await supabase.from('post_comments').delete().eq('id', commentId).eq('author_uid', user.uid);
    if (error) {
      toast.error('حدث خطأ أثناء الحذف');
    } else {
      toast.success('تم حذف التعليق');
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase.from('community_posts').update({ comments_count: post.comments_count - 1 }).eq('id', postId);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count - 1 } : p));
      }
    }
  };

  const startEditingPost = (post: Post) => {
    setEditingPostId(post.id);
    const rawParts = post.content.split('\n\n');
    const textContent = rawParts
      .filter(p => !p.startsWith('[IMG::'))
      .join('\n\n');
    
    setEditPostContent(textContent);
    setEditPostCode(post.code_snippet || '');
    setEditPostTags(post.tags.join(', '));
  };

  const handleSavePostEdit = async (postId: string) => {
    if (!user) return;
    setSubmitting(true);
    
    const tags = editPostTags.split(/[,،\s]+/).filter(t => t.trim()).map(t => t.replace('#', '').trim());
    
    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return;
    
    const rawParts = originalPost.content.split('\n\n');
    const imagePart = rawParts.find(p => p.startsWith('[IMG::'));
    
    let finalContent = editPostContent.trim();
    if (imagePart) finalContent += `\n\n${imagePart}`;

    const { error } = await supabase.from('community_posts').update({
      content: finalContent,
      code_snippet: editPostCode.trim() || null,
      tags
    }).eq('id', postId).eq('author_uid', user.uid);

    if (error) {
      toast.error('حدث خطأ أثناء التحديث');
    } else {
      toast.success('تم تحديث المنشور');
      setEditingPostId(null);
      fetchPosts();
    }
    setSubmitting(false);
  };

  const startEditingComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleSaveCommentEdit = async (commentId: string, postId: string) => {
    if (!user) return;
    
    const { error } = await supabase.from('post_comments').update({
      content: editCommentContent.trim()
    }).eq('id', commentId).eq('author_uid', user.uid);

    if (error) {
      toast.error('حدث خطأ أثناء التحديث');
    } else {
      toast.success('تم تحديث التعليق');
      setEditingCommentId(null);
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(c => c.id === commentId ? { ...c, content: editCommentContent.trim() } : c)
      }));
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  const avatarColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-indigo-600', 'bg-cyan-600'];
  const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  const autoLinkText = (text: string): React.ReactNode[] => {
    // Match both https?:// URLs and plain domains like facebook.com
    const urlRegex = /(https?:\/\/[^\s]+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|co|app|dev|ai|me|gov|edu|ly|gg|to|link|info|site|online|store|shop|tech)(?:\/[^\s]*)?)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0; // reset after test
        const href = part.startsWith('http') ? part : `https://${part}`;
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline break-all"
            onClick={e => e.stopPropagation()}
            dir="ltr"
          >
            {part}
          </a>
        );
      }
      urlRegex.lastIndex = 0;
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f7f9fb] dark:bg-[#050505]" dir="rtl">

        {/* Mobile-only sticky top bar */}
        <div className="md:hidden sticky top-16 z-40 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-lg border-b border-slate-100 dark:border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
            <Users size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-base font-black text-slate-900 dark:text-white tracking-wide">المجتمع</span>
          <button
            onClick={() => toast('البحث قريباً!', { icon: '🔍' })}
            className="p-2 rounded-full text-gray-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            aria-label="بحث"
          >
            <Search size={20} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 lg:py-12 pb-28 md:pb-12">
          
          {/* Header - desktop only */}
          <div className="hidden md:block mb-10 text-right">
            <h1 className="text-4xl md:text-5xl font-black text-[#091426] dark:text-white mb-3">
              مجتمع TOLZY: شارك، تعلّم، وتطوّر
            </h1>
            <p className="text-[#45474c] dark:text-slate-400 text-xl font-medium">
              التقِ بالمبدعين والمطورين، شارك تجاربك مع أدوات AI وأكوادك.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Feed Column */}
            <div className="flex-1 space-y-8">
              
              {/* Post Trigger Banner */}
              {user ? (
                <div 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] p-4 shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-3 sm:gap-4 cursor-text transition-all hover:shadow-md hover:border-[#fea619]/30 group"
                >
                  <div className={`w-12 h-12 rounded-full shrink-0 ${getAvatarColor(user.displayName || 'م')} flex items-center justify-center text-white font-black text-lg shadow-inner`}>
                    {user?.displayName?.[0] || 'م'}
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-full px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base text-right transition-colors group-hover:bg-slate-100 dark:group-hover:bg-white/10">
                    بم تفكر يا {user.displayName?.split(' ')[0] || 'صديقي'}؟ مساحة للإبداع...
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 pr-2 border-r border-slate-100 dark:border-white/10">
                    <button className="p-2 sm:p-2.5 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 rounded-full hover:scale-110 transition-transform">
                      <ImageIcon size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 text-center text-slate-500 border border-slate-100 dark:border-white/5 font-medium shadow-sm">
                  سجّل دخولك لمشاركة إبداعاتك مع المجتمع!
                </div>
              )}

              {/* === عرض المنشورات === */}
              <div className="space-y-6">
                {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-[#fea619]" /></div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">لا توجد منشورات بعد. كن أول من يشارك!</div>
                ) : (
                  posts.map(post => {
                    const isExpanded = expandedPostsContent.has(post.id);
                    const isCommentsOpen = expandedComments.has(post.id);
                    const comments = commentsMap[post.id] || [];
                    const isLoadingComments = loadingComments.has(post.id);

                    let textContent = post.content || '';
                    let extractedImage = null;
                    let legacyLink = null;

                    // استخراج الصور المرفوعة
                    const imgMatch = textContent.match(/\[IMG::(.*?)\]/);
                    if (imgMatch) {
                      extractedImage = imgMatch[1];
                      textContent = textContent.replace(imgMatch[0], '');
                    }

                    // دعم الروابط القديمة إن وجدت
                    const linkMatch = textContent.match(/\[LINK::(.*?)\]/);
                    if (linkMatch) {
                      legacyLink = linkMatch[1];
                      textContent = textContent.replace(linkMatch[0], '');
                    }

                    // نظام الروابط الذكية (Smart Link Detection) - يدعم الروابط بدون https://
                    const smartUrlRegex = /(https?:\/\/[^\s]+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|co|app|dev|ai|me|gov|edu|ly|gg|to|link|info|site|online|store|shop|tech)(?:\/[^\s]*)?)/g;
                    const urlsInText = textContent.match(smartUrlRegex);
                    const displayLink = legacyLink || (urlsInText ? urlsInText[0] : null);

                    const isLongContent = textContent.length > 200;

                    return (
                      <div key={post.id} className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                        
                        {/* ─── Header ─── */}
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full shrink-0 ${getAvatarColor(post.author_name)} flex items-center justify-center text-white font-black text-lg`}>
                              {post.author_avatar && post.author_avatar.length > 1 ? (
                                <img src={post.author_avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                post.author_name[0]
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{post.author_name}</h3>
                              <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                                <span>{timeAgo(post.created_at)}</span>
                                <span>•</span>
                                <Globe size={10} />
                              </div>
                            </div>
                          </div>
                          
                          {user?.uid === post.author_uid && (
                            <div className="flex gap-2">
                              <button onClick={() => startEditingPost(post)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeletePost(post.id, post.author_uid)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                          )}
                        </div>

                        {/* ─── Content ─── */}
                        <div className="px-4 pb-3">
                          {editingPostId === post.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editPostContent}
                                onChange={e => setEditPostContent(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none"
                                rows={4}
                              />
                              <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingPostId(null)} className="text-sm font-bold text-slate-500">إلغاء</button>
                                <button onClick={() => handleSavePostEdit(post.id)} className="text-sm font-black text-[#fea619]">حفظ التعديل</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed whitespace-pre-wrap">
                                {isExpanded || !isLongContent ? autoLinkText(textContent) : autoLinkText(textContent.slice(0, 200) + '...')}
                              </p>
                              {isLongContent && (
                                <button
                                  onClick={() => toggleExpandContent(post.id)}
                                  className="text-blue-600 dark:text-blue-400 text-sm font-bold mt-1 hover:underline"
                                >
                                  {isExpanded ? 'عرض أقل' : '... رؤية المزيد'}
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        {/* ─── Tags ─── */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                            {post.tags.map(tag => (
                              <span key={tag} className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-black rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* ─── Image ─── */}
                        {extractedImage && (
                          <div className="w-full overflow-hidden mt-2 border-t border-slate-50 dark:border-white/5">
                            <img src={extractedImage} alt="Post media" className="w-full max-h-[400px] object-cover" loading="lazy" />
                          </div>
                        )}

                        {/* ─── Code ─── */}
                        {post.code_snippet && (
                          <div className="mx-4 my-3 relative">
                            <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl overflow-x-auto font-mono text-sm leading-relaxed border border-white/5" dir="ltr">
                              <code>{post.code_snippet}</code>
                            </pre>
                            <div className="absolute top-3 right-3 text-[9px] bg-white/10 text-white/50 px-2 py-0.5 rounded font-bold uppercase tracking-widest">code</div>
                          </div>
                        )}

                        {/* ─── Smart Link Card ─── */}
                        {displayLink && (
                          <div className="mx-4 my-3">
                            <a href={displayLink} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 hover:border-blue-300 dark:hover:border-blue-800/50 hover:shadow-md transition-all group overflow-hidden">
                              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                                <LinkIcon size={24} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">مرفق رابط</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate block group-hover:text-blue-600 dark:group-hover:text-blue-400" dir="ltr">{displayLink}</span>
                              </div>
                            </a>
                          </div>
                        )}

                        {/* ─── Stats ─── */}
                        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-50 dark:border-white/5">
                          {post.votes_count > 0 ? (
                            <div className="flex items-center gap-1">
                              <div className="flex -space-x-0.5 ml-1">
                                <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">❤️</span>
                                <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">👍</span>
                              </div>
                              <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{post.votes_count}</span>
                            </div>
                          ) : <div />}
                          
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                            <button
                              onClick={() => toggleComments(post.id)}
                              className="hover:text-blue-500 transition-colors"
                            >{post.comments_count} تعليق</button>
                            <span>•</span>
                            <button
                              onClick={() => handleShare(post.id)}
                              className="hover:text-green-500 transition-colors"
                            >{shareCounts[post.id] ?? (post as any).shares_count ?? 0} مشاركة</button>
                          </div>
                        </div>

                        {/* ─── Actions ─── */}
                        {(() => {
                          const REACTIONS_MAP: Record<string, { label: string, img: string, color: string, icon: any }> = {
                            like: { label: 'أعجبني', img: '👍', color: 'text-blue-500', icon: <Heart size={18} fill="currentColor" /> },
                            love: { label: 'أحببته', img: '❤️', color: 'text-red-500', icon: <Heart size={18} fill="currentColor" /> },
                            haha: { label: 'هاها', img: '😂', color: 'text-yellow-500', icon: <span className="text-lg leading-none">😂</span> },
                            wow: { label: 'واو', img: '😮', color: 'text-yellow-500', icon: <span className="text-lg leading-none">😮</span> },
                            sad: { label: 'حزين', img: '😢', color: 'text-yellow-500', icon: <span className="text-lg leading-none">😢</span> },
                            angry: { label: 'غاضب', img: '😡', color: 'text-orange-500', icon: <span className="text-lg leading-none">😡</span> }
                          };
                          
                          const userReactionMap = userReactions[post.id];
                          const hasReacted = !!userReactionMap;
                          const currentReactionData = userReactionMap ? REACTIONS_MAP[userReactionMap] : null;

                          return (
                            <div className="flex items-center border-t border-slate-50 dark:border-white/5 relative">
                              <div className="flex-1 relative group/action">
                                {/* Reactions Popup on Hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-700/50 p-2 flex items-center gap-2 opacity-0 invisible group-hover/action:opacity-100 group-hover/action:visible group-hover/action:z-50 transition-all duration-300 transform scale-95 group-hover/action:scale-100 origin-bottom group-hover/action:translate-y-0 translate-y-2 pointer-events-none group-hover/action:pointer-events-auto">
                                  {Object.entries(REACTIONS_MAP).map(([type, data], i) => (
                                    <button
                                      key={type}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleVote(post.id, type);
                                      }}
                                      className="relative group/emoji w-10 h-10 flex items-center justify-center transition-all duration-200 hover:-translate-y-2"
                                      style={{ transitionDelay: `${i * 30}ms` }}
                                    >
                                      <div className="text-[28px] transform transition-transform duration-200 hover:scale-125 filter drop-shadow-sm group-hover/emoji:drop-shadow-md">
                                        {data.img}
                                      </div>
                                      <span className="absolute -top-10 bg-slate-900/90 dark:bg-black/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover/emoji:opacity-100 pointer-events-none whitespace-nowrap shadow-lg backdrop-blur-sm transition-opacity duration-200">
                                        {data.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                                
                                <div id={`emoji-burst-${post.id}`} className="absolute inset-0 pointer-events-none overflow-visible z-10" />
                                
                                <button
                                  onClick={(e) => {
                                    handleVote(post.id, userReactionMap === 'like' ? 'like' : (userReactionMap ? userReactionMap : 'like'));
                                    // Burst emoji particles
                                    const burst = document.getElementById(`emoji-burst-${post.id}`);
                                    if (burst && !hasReacted) {
                                      const emojisToBurst = ['👍', '❤️', '🔥', '✨'];
                                      for (let k = 0; k < 5; k++) {
                                        const span = document.createElement('span');
                                        span.textContent = emojisToBurst[Math.floor(Math.random() * emojisToBurst.length)];
                                        span.style.cssText = `position:absolute;font-size:${14+Math.random()*10}px;left:${30+Math.random()*40}%;top:0;pointer-events:none;animation:emojiFloat 0.9s ease-out forwards;animation-delay:${k*80}ms;`;
                                        burst.appendChild(span);
                                        setTimeout(() => span.remove(), 1100);
                                      }
                                    }
                                  }}
                                  className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-black transition-colors rounded-xl md:rounded-lg ${
                                    hasReacted ? currentReactionData?.color : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                  }`}
                                >
                                  <motion.div
                                    animate={hasReacted ? { scale: [1, 1.4, 1], rotate: [0, -15, 15, 0] } : { scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="transition-transform"
                                  >
                                    {hasReacted && currentReactionData ? currentReactionData.icon : <Heart size={18} fill="none" />}
                                  </motion.div>
                                  {hasReacted && currentReactionData ? currentReactionData.label : 'أعجبني'}
                                </button>
                              </div>
                              <div className="w-px h-6 bg-slate-100 dark:bg-white/5" />
                              <button
                                onClick={() => toggleComments(post.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black transition-colors ${
                                  isCommentsOpen ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                }`}
                              >
                                <MessageSquare size={18} />
                                تعليق
                              </button>
                              <div className="w-px h-6 bg-slate-100 dark:bg-white/5" />
                              <button
                                onClick={() => handleShare(post.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                              >
                                <Share2 size={18} />
                                مشاركة
                              </button>
                            </div>
                          );
                        })()}

                        {/* ─── Quick Reply ─── */}
                        <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-50 dark:border-white/5">
                          <div className={`w-8 h-8 rounded-full shrink-0 ${user ? getAvatarColor(user.displayName || 'م') : 'bg-slate-300'} flex items-center justify-center text-white font-bold text-sm`}>
                            {user?.displayName?.[0] || 'م'}
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                              onFocus={() => { if (!isCommentsOpen) toggleComments(post.id); }}
                              placeholder="اكتب تعليقاً..."
                              className="w-full bg-slate-100 dark:bg-white/5 rounded-full py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!commentInputs[post.id]?.trim()}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 disabled:text-slate-300 dark:disabled:text-slate-600 transition-colors"
                            >
                              <Send size={16} className="rtl:-scale-x-100" />
                            </button>
                          </div>
                        </div>

                        {/* ─── Comments ─── */}
                        {isCommentsOpen && (
                          <div className="px-4 pb-4 border-t border-slate-50 dark:border-white/5 pt-4">
                            {isLoadingComments ? (
                              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                            ) : (
                              <>
                                {comments.length === 0 && <p className="text-center text-slate-400 text-sm py-3">لا توجد تعليقات بعد</p>}
                                <div className="space-y-3">
                                  {comments.map(c => (
                                    <div key={c.id} className="flex items-start gap-3">
                                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(c.author_name)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                        {c.author_name[0]}
                                      </div>
                                      <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-2xl px-4 py-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-black text-sm text-slate-800 dark:text-white">{c.author_name}</span>
                                            <span className="text-[10px] text-slate-400">{timeAgo(c.created_at)}</span>
                                          </div>
                                          {user?.uid === c.author_uid && (
                                            <div className="flex items-center gap-1">
                                              <button onClick={() => startEditingComment(c)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors"><Edit2 size={12} /></button>
                                              <button onClick={() => handleDeleteComment(c.id, post.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                            </div>
                                          )}
                                        </div>
                                        {editingCommentId === c.id ? (
                                          <div className="mt-1 space-y-2">
                                            <input
                                              type="text"
                                              value={editCommentContent}
                                              onChange={e => setEditCommentContent(e.target.value)}
                                              onKeyDown={e => e.key === 'Enter' && handleSaveCommentEdit(c.id, post.id)}
                                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg p-2 text-sm focus:outline-none"
                                              autoFocus
                                            />
                                            <div className="flex justify-end gap-3">
                                              <button onClick={() => setEditingCommentId(null)} className="text-[11px] font-bold text-slate-500">إلغاء</button>
                                              <button onClick={() => handleSaveCommentEdit(c.id, post.id)} className="text-[11px] font-black text-blue-600">حفظ</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-slate-600 dark:text-slate-300 text-[14px] leading-relaxed">{c.content}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Contextual Sidebar */}
            <aside className="hidden lg:block lg:w-[320px] space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-[#fea619]/10 text-[#fea619] flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">الهاشتاجات النشطة</h3>
                </div>
                {trendingTags.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">لا توجد هاشتاجات بعد</p>
                ) : (
                  <div className="space-y-4">
                    {trendingTags.map(tag => (
                      <div key={tag.name} className="flex items-center justify-between group cursor-pointer hover:translate-x-[-4px] transition-transform">
                        <span className="text-slate-700 dark:text-slate-300 font-bold group-hover:text-[#fea619] transition-colors">#{tag.name}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-xs font-bold">{tag.count} منشور</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">أبرز المساهمين</h3>
                </div>
                {topContributors.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">لا يوجد مساهمين بعد</p>
                ) : (
                  <div className="space-y-5">
                    {topContributors.map((contributor, idx) => (
                      <div key={idx} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(contributor.name)} flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-110 transition-transform`}>
                            {contributor.avatar}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#fea619] transition-colors">{contributor.name}</h4>
                            <p className="text-[10px] text-slate-400">{contributor.posts} منشور</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-amber-50 dark:bg-[#fea619]/10 text-[#fea619] text-[10px] font-black rounded-lg">
                          {idx === 0 ? '🏆' : 'MEMBER'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-indigo-600 rounded-[32px] p-8 shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-3">Upgrade to Pro</p>
                <h3 className="text-xl font-black text-white mb-4 leading-tight">احصل على وصول كامل لجميع ميزات الذكاء الاصطناعي</h3>
                <Link href="/pricing" className="block w-full">
                  <button className="w-full bg-[#fea619] text-white py-3 rounded-2xl font-black hover:scale-105 transition-transform shadow-lg shadow-black/10">
                    ترقية الخطة
                  </button>
                </Link>
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile Comments Sheet */}
        {activePostIdForMobileComments && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:hidden">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setActivePostIdForMobileComments(null)}
            />
            <div className="relative bg-white dark:bg-slate-900 w-full max-h-[90vh] rounded-t-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500 ease-out border-t border-slate-100 dark:border-white/5">
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-white/5">
                <button 
                  onClick={() => setActivePostIdForMobileComments(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">التعليقات</h3>
                  <span className="bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                    {posts.find(p => p.id === activePostIdForMobileComments)?.comments_count || 0}
                  </span>
                </div>
                <div className="w-10" /> 
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {loadingComments.has(activePostIdForMobileComments) && (commentsMap[activePostIdForMobileComments]?.length || 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#fea619]" />
                    <p className="text-slate-400 font-bold">جاري تحميل التعليقات...</p>
                  </div>
                ) : (commentsMap[activePostIdForMobileComments] || []).length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center">
                      <MessageSquare size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold">لا توجد تعليقات بعد. كن أول من يشارك!</p>
                  </div>
                ) : (
                  (commentsMap[activePostIdForMobileComments] || []).map(c => (
                    <div key={c.id} className="flex items-start gap-4 animate-in slide-in-from-right duration-300">
                      <div className={`w-10 h-10 rounded-full ${getAvatarColor(c.author_name)} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm shadow-black/5`}>
                        {c.author_name[0]}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/30 rounded-[1.5rem] p-4 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-sm text-slate-900 dark:text-white">{c.author_name}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{timeAgo(c.created_at)}</span>
                          </div>
                          {user?.uid === c.author_uid && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => startEditingComment(c)} className="p-1 text-slate-400 hover:text-[#fea619] transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteComment(c.id, activePostIdForMobileComments!)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                          )}
                        </div>
                        {editingCommentId === c.id ? (
                          <div className="mt-2 space-y-3">
                            <input 
                              type="text" 
                              value={editCommentContent} 
                              onChange={e => setEditCommentContent(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSaveCommentEdit(c.id, activePostIdForMobileComments!)}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#fea619]/30"
                              autoFocus
                            />
                            <div className="flex justify-end gap-4">
                              <button onClick={() => setEditingCommentId(null)} className="text-xs font-bold text-slate-500">إلغاء</button>
                              <button onClick={() => handleSaveCommentEdit(c.id, activePostIdForMobileComments!)} className="text-xs font-black text-[#fea619]">حفظ</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{c.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-6 py-6 pb-28 border-t border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${user ? getAvatarColor(user.displayName || 'م') : 'bg-slate-300'} flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md`}>
                    {user?.displayName?.[0] || 'م'}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentInputs[activePostIdForMobileComments] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [activePostIdForMobileComments!]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment(activePostIdForMobileComments!)}
                      placeholder="اكتب تعليقك هنا..."
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[1.5rem] py-4 pr-14 pl-5 text-sm focus:outline-none focus:ring-4 focus:ring-[#fea619]/20 transition-all shadow-sm"
                    />
                    <button
                      onClick={() => handleAddComment(activePostIdForMobileComments!)}
                      disabled={!commentInputs[activePostIdForMobileComments]?.trim()}
                      className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-[#fea619] text-white rounded-full flex items-center justify-center hover:bg-[#ffb95f] transition-all active:scale-90 disabled:opacity-50 disabled:grayscale shadow-lg shadow-[#fea619]/30"
                    >
                      <Send size={18} className="rtl:-scale-x-100" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ Share Sheet ═══════ */}
        {shareSheetPostId && (
          <div className="fixed inset-0 z-[60] flex items-end" dir="rtl">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShareSheetPostId(null)}
            />
            <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-bottom duration-400 ease-out pb-safe">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Title */}
              <div className="px-6 py-4 border-b border-slate-50 dark:border-white/5">
                <h3 className="font-black text-slate-900 dark:text-white text-lg text-center">مشاركة المنشور</h3>
              </div>

              {/* Share Apps Row */}
              <div className="flex items-center justify-around px-6 py-6">

                {/* WhatsApp */}
                <button
                  onClick={() => sharePost(shareSheetPostId, 'whatsapp')}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.132.558 4.13 1.535 5.862L.057 23.57a.75.75 0 0 0 .927.927l5.71-1.478A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.66-.523-5.166-1.432l-.37-.22-3.838.992.993-3.837-.221-.371A10 10 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">واتساب</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => sharePost(shareSheetPostId, 'telegram')}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#0088cc]/10 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#0088cc]"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">تيليجرام</span>
                </button>

                {/* Twitter / X */}
                <button
                  onClick={() => sharePost(shareSheetPostId, 'twitter')}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-black dark:fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">X (تويتر)</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => sharePost(shareSheetPostId, 'facebook')}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">فيسبوك</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => sharePost(shareSheetPostId, 'copy')}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-sm">
                    <LinkIcon size={26} className="text-slate-700 dark:text-slate-200" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">نسخ الرابط</span>
                </button>
              </div>

              {/* Cancel */}
              <div className="px-6 pb-8">
                <button
                  onClick={() => setShareSheetPostId(null)}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-200 dark:hover:bg-white/15 transition-colors active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Create Post Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl sm:rounded-[2rem] rounded-t-[2rem] p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <h3 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="bg-[#fea619]/20 text-[#fea619] p-1.5 rounded-xl"><Send size={18} /></span>
                  إنشاء منشور جديد
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.displayName || 'م')} flex items-center justify-center text-white font-bold opacity-90 shadow-sm`}>
                    {user?.displayName?.[0] || 'م'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{user.displayName}</div>
                    <div className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block mt-0.5">علني للمجتمع</div>
                  </div>
                </div>
              )}

              {/* Text Area */}
              <div className="relative mt-2">
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="شارِك أفكارك، أكوادك، أو أعمالك مع المجتمع هنا..."
                  className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-2xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fea619]/50 focus:bg-white dark:focus:bg-slate-800 resize-none text-right font-medium text-[15px] min-h-[140px] leading-relaxed transition-all"
                  autoFocus
                />
              </div>

              {/* Tags Input */}
              <div className="relative group">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">#</div>
                <input
                  type="text"
                  value={postTags}
                  onChange={e => setPostTags(e.target.value)}
                  placeholder="عناوين المنشور (مفصولة بمسافة أو فاصلة)"
                  className="w-full bg-slate-50 dark:bg-slate-800/40 rounded-xl pr-8 pl-4 py-3 text-slate-700 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fea619]/50 text-right text-sm font-medium transition-all"
                />
              </div>

              {/* Code Snippet Input */}
              {showCodeInput && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200 relative">
                  <div className="absolute right-3 top-3 text-slate-500"><Code size={16} /></div>
                  <textarea
                    value={postCode}
                    onChange={e => setPostCode(e.target.value)}
                    placeholder="الصق الكود هنا (يتم تلوينه تلقائياً عند النشر)"
                    className="w-full bg-[#0d1117] text-slate-200 border border-slate-700 rounded-xl pr-10 pl-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[100px] resize-y text-left"
                    dir="ltr"
                  />
                  <button onClick={() => setShowCodeInput(false)} className="absolute left-3 top-3 text-slate-400 hover:text-red-400 bg-slate-800 rounded-full p-1 transition-colors"><X size={14}/></button>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block animate-in fade-in zoom-in-95 duration-200 w-max mt-2">
                  <img src={imagePreview} alt="Preview" className="h-40 rounded-2xl object-cover shadow-md border-2 border-slate-200 dark:border-white/10" />
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <X size={14} />
                  </button>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <div className="w-8 h-8 border-4 border-white shadow-sm border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <label className="p-2 sm:px-3 sm:py-2 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all cursor-pointer flex items-center gap-2" title="إرفاق صورة">
                    <ImageIcon size={22} />
                    <span className="text-xs font-bold hidden sm:block">صورة</span>
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                  <button onClick={() => setShowCodeInput(true)} disabled={showCodeInput} className="p-2 sm:px-3 sm:py-2 rounded-xl text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50" title="إرفاق كود">
                    <Code size={22} />
                    <span className="text-xs font-bold hidden sm:block">كود</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleCreatePost();
                    if (postContent.trim() || imageFile) setShowCreateModal(false);
                  }}
                  disabled={(!postContent.trim() && !imageFile) || submitting}
                  className="px-8 py-3 rounded-xl bg-[#fea619] hover:bg-[#ffb95f] hover:shadow-lg hover:shadow-[#fea619]/40 text-black font-black text-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rtl:-scale-x-100" />}
                  نشر الآن
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

    </PageLayout>
  );
};

export default CommunityPage;