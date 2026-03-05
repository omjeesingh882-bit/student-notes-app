const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'student-notes',
        resource_type: 'raw', // "raw" is used for non-image files like PDF, DOCX, PPTX
        // format: async (req, file) => 'pdf', // We do not force format
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|ppt|pptx/;

        const isExtValid = filetypes.test(file.originalname.toLowerCase());
        const isMimeValid = filetypes.test(file.mimetype);

        if (isExtValid) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Documents Only (PDF, DOC, PPT)!'));
        }
    }
});

module.exports = upload;
