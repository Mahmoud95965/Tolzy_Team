import { NextRequest, NextResponse } from 'next/server';
import { uploadArticleImage } from '@/src/services/articles.service';

// POST: Upload article image to Supabase Storage
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
                { status: 400 }
            );
        }

        // File size limit removed per requirement
        // const maxSize = 5 * 1024 * 1024; // 5MB
        // if (file.size > maxSize) { ... }

        const imageUrl = await uploadArticleImage(file);

        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Failed to upload image' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            url: imageUrl,
            message: 'Image uploaded successfully',
        });
    } catch (error: any) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: 'Failed to upload image', message: error.message },
            { status: 500 }
        );
    }
}
