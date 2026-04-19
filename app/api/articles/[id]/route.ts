import { NextRequest, NextResponse } from 'next/server';
import {
    getArticleById,
    updateArticle,
    deleteArticle,
    incrementViews,
} from '@/src/services/articles.service';

// GET: Fetch single article by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const article = await getArticleById(id);

        if (!article) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        // Increment views for published articles
        if (article.status === 'published') {
            await incrementViews(id);
        }

        return NextResponse.json({ article });
    } catch (error: any) {
        console.error('Error fetching article:', error);
        return NextResponse.json(
            { error: 'Failed to fetch article', message: error.message },
            { status: 500 }
        );
    }
}

// PUT: Update article (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();

        await updateArticle(id, body);

        return NextResponse.json({ message: 'Article updated successfully' });
    } catch (error: any) {
        console.error('Error updating article:', error);
        return NextResponse.json(
            { error: 'Failed to update article', message: error.message },
            { status: 500 }
        );
    }
}

// DELETE: Delete article (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await deleteArticle(id);

        return NextResponse.json({ message: 'Article deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting article:', error);
        return NextResponse.json(
            { error: 'Failed to delete article', message: error.message },
            { status: 500 }
        );
    }
}
