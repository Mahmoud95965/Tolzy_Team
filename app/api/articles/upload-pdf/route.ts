import { NextRequest, NextResponse } from 'next/server';
import { uploadArticlePDF } from '@/src/services/articles.service';

// POST: Upload PDF file
export async function POST(request: NextRequest) {
    try {
        console.log('📥 PDF upload request received');

        const formData = await request.formData();
        const file = formData.get('file') as File;

        console.log('📄 File info:', {
            name: file?.name,
            type: file?.type,
            size: file?.size
        });

        if (!file) {
            console.error('❌ No file provided');
            return NextResponse.json(
                { error: 'الرجاء اختيار ملف PDF' },
                { status: 400 }
            );
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            console.error('❌ Invalid file type:', file.type);
            return NextResponse.json(
                { error: 'يرجى رفع ملف PDF فقط' },
                { status: 400 }
            );
        }

        // Validate file size (20MB max)
        const maxSize = 20 * 1024 * 1024;
        if (file.size > maxSize) {
            console.error('❌ File too large:', file.size);
            return NextResponse.json(
                { error: 'حجم الملف يتجاوز 20 ميجابايت' },
                { status: 400 }
            );
        }

        console.log('✅ Validation passed, uploading to Supabase...');

        // Upload to Supabase
        const pdfUrl = await uploadArticlePDF(file);

        console.log('📤 Upload result:', pdfUrl);

        if (!pdfUrl) {
            console.error('❌ Upload failed - no URL returned');
            return NextResponse.json(
                { error: 'فشل رفع ملف PDF - تحقق من إعدادات Supabase' },
                { status: 500 }
            );
        }

        console.log('✅ PDF uploaded successfully:', pdfUrl);

        return NextResponse.json({
            pdfUrl,
            fileName: file.name,
            fileSize: file.size
        });

    } catch (error: any) {
        console.error('💥 Error uploading PDF:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return NextResponse.json(
            {
                error: 'حدث خطأ أثناء رفع الملف',
                message: error.message,
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
