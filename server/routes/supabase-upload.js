import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Supabase Storage bucket name
const BUCKET_NAME = 'hero-videos';

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Only allow video files
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed (mp4, webm, ogg, mov)'), false);
        }
    }
});

// Upload video to Supabase Storage
router.post('/video', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        console.log('Starting upload to Supabase Storage...');
        console.log('File details:', {
            name: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${sanitizedName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({
                error: 'Failed to upload to Supabase',
                details: error.message
            });
        }

        console.log('Upload successful:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        const publicUrl = urlData?.publicUrl;

        res.status(201).json({
            message: 'Video uploaded successfully',
            url: publicUrl,
            fileName: fileName,
            size: req.file.size
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to upload video',
            details: error.message
        });
    }
});

// Delete video from Supabase Storage
router.delete('/video/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName]);

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({
                error: 'Failed to delete video',
                details: error.message
            });
        }

        res.json({ message: 'Video deleted successfully' });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            error: 'Failed to delete video',
            details: error.message
        });
    }
});

export default router;
