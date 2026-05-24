import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Article {
    id: string;
    title: string;
    content?: string;
    pdf_url?: string;
    content_type: 'pdf' | 'html';
    excerpt?: string;
    cover_image_url?: string;
    author_id: string;
    author_name?: string;
    author_email?: string;
    status: 'draft' | 'published';
    tags?: string[];
    category?: string;
    article_type?: 'explanation' | 'news';
    reading_time?: number;
    views_count: number;
    likes_count: number;
    shares_count: number;
    created_at: string;
    updated_at: string;
    published_at?: string;
    summary?: string;
}

// ... existing code ...



export interface CreateArticleInput {
    title: string;
    content?: string;
    pdf_url?: string;
    content_type: 'pdf' | 'html';
    excerpt?: string;
    cover_image_url?: string;
    author_id: string;
    author_name?: string;
    author_email?: string;
    status?: 'draft' | 'published';
    tags?: string[];
    category?: string;
    article_type?: 'explanation' | 'news';
    reading_time?: number;
}

export interface Comment {
    id: string;
    article_id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    content: string;
    created_at: string;
    parent_id?: string | null;
    likes_count?: number;
}

// Get published articles with pagination
export async function getPublishedArticles(
    page: number = 1,
    limit: number = 10
): Promise<{ articles: Article[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
        .from('ai_articles')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching published articles:', error);
        throw error;
    }

    return {
        articles: data as Article[],
        total: count || 0,
    };
}

// Get single article by ID
export async function getArticleById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
        .from('ai_articles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching article:', error);
        return null;
    }

    return data as Article;
}

// Get all articles (admin only)
export async function getAllArticles(): Promise<Article[]> {
    const { data, error } = await supabase
        .from('ai_articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all articles:', error);
        throw error;
    }

    return data as Article[];
}

// Create new article
export async function createArticle(input: CreateArticleInput): Promise<string> {
    const articleData = {
        ...input,
        status: input.status || 'draft',
        published_at: input.status === 'published' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
        .from('ai_articles')
        .insert([articleData])
        .select()
        .single();

    if (error) {
        console.error('Error creating article:', error);
        throw error;
    }

    return data.id;
}

// Update article
export async function updateArticle(
    id: string,
    updates: Partial<CreateArticleInput>
): Promise<void> {
    const updateData: any = { ...updates };

    // Update published_at if status changes to published
    if (updates.status === 'published') {
        updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('ai_articles')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating article:', error);
        throw error;
    }
}

// Delete article
export async function deleteArticle(id: string): Promise<void> {
    const { error } = await supabase.from('ai_articles').delete().eq('id', id);

    if (error) {
        console.error('Error deleting article:', error);
        throw error;
    }
}

// Increment view count
export async function incrementViews(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_article_views', {
        article_id: id,
    });

    if (error) {
        // If RPC doesn't exist, fallback to manual increment
        const { data: article } = await supabase
            .from('ai_articles')
            .select('views_count')
            .eq('id', id)
            .single();

        if (article) {
            await supabase
                .from('ai_articles')
                .update({ views_count: (article.views_count || 0) + 1 })
                .eq('id', id);
        }
    }
}

// Toggle like
export async function toggleLike(
    id: string,
    increment: boolean
): Promise<void> {
    const { data: article } = await supabase
        .from('ai_articles')
        .select('likes_count')
        .eq('id', id)
        .single();

    if (article) {
        const newCount = increment
            ? (article.likes_count || 0) + 1
            : Math.max((article.likes_count || 0) - 1, 0);

        await supabase
            .from('ai_articles')
            .update({ likes_count: newCount })
            .eq('id', id);
    }
}

// Upload article image to Supabase Storage
export async function uploadArticleImage(
    file: File
): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error uploading image:', error);
        return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('article-images')
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}

// Upload article PDF to Supabase Storage
export async function uploadArticlePDF(
    file: File
): Promise<string | null> {
    console.log('🚀 Starting PDF upload to Supabase');
    console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type
    });

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('📁 Upload path:', filePath);
    console.log('🗄️ Bucket:', 'article-pdfs');

    const { data, error } = await supabase.storage
        .from('article-pdfs')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('❌ Supabase upload error:', error);
        console.error('Error details:', error.message);
        return null;
    }

    console.log('✅ Upload successful, data:', data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('article-pdfs')
        .getPublicUrl(data.path);

    console.log('🔗 Public URL:', publicUrlData.publicUrl);

    return publicUrlData.publicUrl;
}


// Get articles by category
export async function getArticlesByCategory(
    category: string,
    limit: number = 10
): Promise<Article[]> {
    const { data, error } = await supabase
        .from('ai_articles')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .order('published_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching articles by category:', error);
        return [];
    }

    return data as Article[];
}

// Search articles
export async function searchArticles(query: string): Promise<Article[]> {
    const { data, error } = await supabase
        .from('ai_articles')
        .select('*')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error searching articles:', error);
        return [];
    }

    return data as Article[];
}

// Get article comments
export async function getArticleComments(articleId: string): Promise<Comment[]> {
    const { data, error } = await supabase
        .from('article_comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }

    return data as Comment[];
}

// Add comment
export async function addArticleComment(
    articleId: string,
    userId: string,
    userName: string,
    content: string,
    userAvatar?: string,
    parentId?: string
): Promise<Comment | null> {
    const payload: any = {
        article_id: articleId,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        content
    };

    if (parentId) {
        payload.parent_id = parentId;
    }

    const { data, error } = await supabase
        .from('article_comments')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('Error adding comment:', error.message, error.details, error.hint);
        return null;
    }

    return data as Comment;
}

// Toggle comment like
export async function toggleCommentLike(
    commentId: string,
    userId: string
): Promise<{ liked: boolean; newCount: number } | null> {
    // 1. Check if user already liked this comment
    const { data: existingLike, error: checkError } = await supabase
        .from('article_comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

    let liked = !!existingLike;

    if (liked) {
        // Unlike
        const { error: deleteError } = await supabase
            .from('article_comment_likes')
            .delete()
            .eq('comment_id', commentId)
            .eq('user_id', userId);

        if (deleteError) {
            console.error('Error removing comment like:', deleteError.message);
            return null;
        }
    } else {
        // Like
        const { error: insertError } = await supabase
            .from('article_comment_likes')
            .insert([{ comment_id: commentId, user_id: userId }]);

        if (insertError) {
            console.error('Error adding comment like:', insertError.message);
            return null;
        }
    }

    // 2. Update count on article_comments
    const { data: comment } = await supabase
        .from('article_comments')
        .select('likes_count')
        .eq('id', commentId)
        .single();

    if (!comment) return null;

    const newCount = liked
        ? Math.max((comment.likes_count || 0) - 1, 0)
        : (comment.likes_count || 0) + 1;

    await supabase
        .from('article_comments')
        .update({ likes_count: newCount })
        .eq('id', commentId);

    return { liked: !liked, newCount };
}

// Delete comment
export async function deleteArticleComment(commentId: string): Promise<boolean> {
    const { error } = await supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error('Error deleting comment:', error.message);
        return false;
    }
    return true;
}

// Get user's liked comments for an article
export async function getUserLikedComments(articleId: string, userId: string): Promise<Set<string>> {
    // We join with comments to filter by article_id, OR we just fetch all likes for the user
    // Since we don't have a direct link from like->article (only via comment),
    // it's easier to fetch all likes for the comments involved.
    // However, simpler query: Select * from article_comment_likes where user_id = userId
    // But that might be too many.
    // Let's use a subquery approach via the client or just fetch all likes for this user created recently?
    // For now, let's just fetch all 'article_comment_likes' for this user.
    // A better approach is: get all comment IDs for this article, then find matches.

    // 1. Get comment IDs for this article first (already have them in UI, but needed here?)
    // Actually, we can just select all likes where user_id = X. If the table grows huge, this is bad.
    // Correct way:
    const { data: comments } = await supabase
        .from('article_comments')
        .select('id')
        .eq('article_id', articleId);

    if (!comments || comments.length === 0) return new Set();

    const commentIds = comments.map(c => c.id);

    const { data: likes } = await supabase
        .from('article_comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', commentIds);

    const likedSet = new Set<string>();
    likes?.forEach(l => likedSet.add(l.comment_id));
    return likedSet;
}

// Check if user liked article
export async function hasUserLikedArticle(articleId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking like status:', error);
    }

    return !!data;
}

// Toggle article like with proper table sync
export async function toggleArticleLike(
    articleId: string,
    userId: string
): Promise<{ liked: boolean; newCount: number } | null> {
    // 1. Check if currently liked
    const liked = await hasUserLikedArticle(articleId, userId);

    // 2. Insert or Delete from article_likes
    if (liked) {
        // Unlike
        const { error: deleteError } = await supabase
            .from('article_likes')
            .delete()
            .eq('article_id', articleId)
            .eq('user_id', userId);

        if (deleteError) {
            console.error('Error removing like:', deleteError.message, deleteError.details, deleteError.hint);
            return null;
        }
    } else {
        // Like
        const { error: insertError } = await supabase
            .from('article_likes')
            .insert([{ article_id: articleId, user_id: userId }]);

        if (insertError) {
            console.error('Error adding like:', insertError.message, insertError.details, insertError.hint);
            return null;
        }
    }

    // 3. Update count on ai_articles
    // We fetch the current count first to be safe, or just atomic increment/decrement
    const { data: article } = await supabase
        .from('ai_articles')
        .select('likes_count')
        .eq('id', articleId)
        .single();

    if (!article) return null;

    const newCount = liked
        ? Math.max((article.likes_count || 0) - 1, 0)
        : (article.likes_count || 0) + 1;

    await supabase
        .from('ai_articles')
        .update({ likes_count: newCount })
        .eq('id', articleId);

    return { liked: !liked, newCount };
}
