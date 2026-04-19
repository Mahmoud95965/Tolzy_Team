import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { uploadArticleImage } from '@/src/services/articles.service';

interface ParsedDocument {
    content: string;
    title?: string;
    excerpt?: string;
    images: string[];
    contentType: 'html' | 'text';
}

// POST: Parse DOCX document
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'الرجاء اختيار ملف' },
                { status: 400 }
            );
        }

        // Validate file type - DOCX only
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'يرجى رفع ملف DOCX فقط. تنسيقات أخرى ستدعم قريباً.' },
                { status: 400 }
            );
        }

        // Validate file size (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'حجم الملف يتجاوز 10 ميجابايت' },
                { status: 400 }
            );
        }

        const result = await parseDOCXDocument(file);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error parsing document:', error);
        return NextResponse.json(
            { error: 'فشل تحليل الملف', message: error.message },
            { status: 500 }
        );
    }
}

/**
 * Parse DOCX document with embedded images
 */
async function parseDOCXDocument(file: File): Promise<ParsedDocument> {
    // Convert File to Buffer for mammoth
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadedImages: string[] = [];

    // Convert DOCX to HTML with image handling
    const result = await mammoth.convertToHtml(
        { buffer },  // mammoth expects buffer, not arrayBuffer
        {
            convertImage: mammoth.images.imgElement(async (image: any) => {
                try {
                    // Read image data
                    const imageBuffer = await image.read();

                    // Convert buffer to Blob then File
                    const imageBlob = new Blob([imageBuffer], {
                        type: image.contentType || 'image/png',
                    });

                    const extension = getExtensionFromContentType(image.contentType);
                    const imageFile = new File(
                        [imageBlob],
                        `doc-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`,
                        { type: image.contentType || 'image/png' }
                    );

                    // Upload image to Supabase
                    const imageUrl = await uploadArticleImage(imageFile);

                    if (imageUrl) {
                        uploadedImages.push(imageUrl);
                        return { src: imageUrl };
                    }

                    return { src: '' };
                } catch (error) {
                    console.error('Error uploading image:', error);
                    return { src: '' };
                }
            }),
            styleMap: [
                "p[style-name='Title'] => h1:fresh",
                "p[style-name='Heading 1'] => h2:fresh",
                "p[style-name='Heading 2'] => h3:fresh",
                "p[style-name='Heading 3'] => h4:fresh",
            ],
        }
    );

    // Extract title from first h1 or h2
    const titleMatch =
        result.value.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
        result.value.match(/<h2[^>]*>(.*?)<\/h2>/i);
    const title = titleMatch ? stripHtmlTags(titleMatch[1]) : undefined;

    // Extract first paragraph as excerpt
    const excerptMatch = result.value.match(/<p[^>]*>(.*?)<\/p>/i);
    const excerpt = excerptMatch
        ? stripHtmlTags(excerptMatch[1]).substring(0, 200)
        : undefined;

    return {
        content: result.value,
        title,
        excerpt,
        images: uploadedImages,
        contentType: 'html',
    };
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromContentType(contentType?: string): string {
    if (!contentType) return 'png';

    const map: { [key: string]: string } = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/bmp': 'bmp',
    };

    return map[contentType] || 'png';
}

/**
 * Strip HTML tags
 */
function stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
}
