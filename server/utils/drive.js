const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const stream = require('stream');

const KEY_FILE_PATH = path.join(__dirname, '../service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Uploads a file to Google Drive
 * @param {Object} fileObj - Multer file object
 * @returns {Promise<Object>} - Drive file object
 */
const uploadFile = async (fileObj) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObj.buffer);

    try {
        const response = await drive.files.create({
            media: {
                mimeType: fileObj.mimetype,
                body: bufferStream,
            },
            requestBody: {
                name: fileObj.originalname,
                parents: [], // Optional: Add folder ID here if needed
            },
            fields: 'id, name, webViewLink, webContentLink',
        });

        // Make the file public so it can be played
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading to Drive:', error);
        throw error;
    }
};

module.exports = { uploadFile };
