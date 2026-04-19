const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../utils/drive');
const Video = require('../models/Video');

// Use memory storage for Drive upload
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Upload Endpoint
router.post('/', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        console.log('Starting upload to Google Drive...');
        const driveFile = await uploadFile(req.file);
        console.log('Upload successful:', driveFile);

        const newVideo = new Video({
            filename: req.file.originalname,
            originalName: req.file.originalname,
            path: 'drive', // Placeholder
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: driveFile.webViewLink,
            driveId: driveFile.id
        });

        await newVideo.save();

        res.status(201).json({
            message: 'Video uploaded successfully',
            video: newVideo
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to upload video',
            details: error.message
        });
    }
});

module.exports = router;
