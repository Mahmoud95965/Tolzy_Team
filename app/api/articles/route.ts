import { NextRequest, NextResponse } from 'next/server';
import {
    getPublishedArticles,
    createArticle,
    getAllArticles,
} from '@/src/services/articles.service';

// GET: Fetch articles (published for public, all for admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const admin = searchParams.get('admin') === 'true';

        if (admin) {
            // Return all articles for admin
            const articles = await getAllArticles();
            return NextResponse.json({ articles });
        } else {
            // Return published articles with pagination for public
            const result = await getPublishedArticles(page, limit);
            return NextResponse.json(result);
        }
    } catch (error: any) {
        console.error('❌ Error fetching articles:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            stack: error.stack
        });
        return NextResponse.json(
            { error: 'Failed to fetch articles', message: error.message, code: error.code },
            { status: 500 }
        );
    }
}

// POST: Create new article (admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log('📝 Creating article with data:', body);

        // Validate required fields (Must have title, author, and EITHER pdf_url OR content)
        if (!body.title || (!body.pdf_url && !body.content) || !body.author_id) {
            console.error('❌ Validation failed - missing fields');
            return NextResponse.json(
                { error: 'Missing required fields: title, author_id, and either content or pdf_url' },
                { status: 400 }
            );
        }

        console.log('✅ Validation passed, calling createArticle...');

        const articleId = await createArticle(body);

        console.log('✅ Article created successfully, ID:', articleId);

        return NextResponse.json(
            { id: articleId, message: 'Article created successfully' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('💥 Error creating article:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return NextResponse.json(
            { error: 'Failed to create article', message: error.message },
            { status: 500 }
        );
    }
}
