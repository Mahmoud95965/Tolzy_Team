import mammoth from 'mammoth';
import { uploadArticleImage } from './articles.service';

// Interface for parsed document result
export interface ParsedDocument {
    content: string; // HTML content with images
    title?: string;
    excerpt?: string;
    images: string[]; // URLs of uploaded images
}

/**
 * Parse DOCX file and extract content with images
 */
export async function parseDOCX(file: File): Promise<ParsedDocument> {
    try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Convert DOCX to HTML with image handling
        const result = await mammoth.convertToHtml(
            { arrayBuffer },
            {
                convertImage: mammoth.images.imgElement(async (image) => {
                    try {
                        // Read image data
                        const imageBuffer = await image.read();

                        // Convert buffer to File object
                        const imageBlob = new Blob([new Uint8Array(imageBuffer)], { type: image.contentType || 'image/png' });
                        const imageFile = new File(
                            [imageBlob],
                            `image-${Date.now()}.${getExtensionFromContentType(image.contentType)}`,
                            { type: image.contentType || 'image/png' }
                        );

                        // Upload image to Supabase
                        const imageUrl = await uploadArticleImage(imageFile);

                        return {
                            src: imageUrl || '',
                        };
                    } catch (error) {
                        console.error('Error processing image:', error);
                        return { src: '' };
                    }
                }),
            }
        );

        // Extract images URLs from HTML
        const imageRegex = /<img[^>]+src="([^">]+)"/g;
        const images: string[] = [];
        let match;
        while ((match = imageRegex.exec(result.value)) !== null) {
            if (match[1]) images.push(match[1]);
        }

        // Try to extract title from first heading
        const titleMatch = result.value.match(/<h1[^>]*>(.*?)<\/h1>/i);
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
            images,
        };
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX file');
    }
}

/**
 * Parse PDF file and extract content (text only, images at end)
 * Note: PDF image extraction with positioning is complex, so we extract text and images separately
 */
export async function parsePDF(file: File): Promise<ParsedDocument> {
    try {
        // For PDF parsing, we'll use a simpler approach on the client side
        // Full PDF parsing with images requires server-side processing

        // Read file
        const arrayBuffer = await file.arrayBuffer();

        // For now, we'll return a placeholder
        // In production, you'd use pdf-parse on server side
        throw new Error('PDF parsing requires server-side processing. Please use the API endpoint.');
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('PDF parsing not supported in browser. Use server API.');
    }
}

/**
 * Helper function to get file extension from MIME type
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
 * Strip HTML tags from string
 */
function stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHTML(html: string): string {
    // Basic sanitization - in production use a library like DOMPurify
    // For now, we'll allow common tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'img', 'a', 'blockquote', 'code', 'pre'];

    // This is a simplified version - use DOMPurify for production
    return html;
}
