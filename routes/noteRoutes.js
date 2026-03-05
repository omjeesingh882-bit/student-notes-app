const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');
const {
    uploadNote,
    getNotes,
    getNoteById,
    downloadNote,
    viewNote,
    toggleLike,
    deleteNote
} = require('../controllers/noteController');

router.route('/')
    .get(getNotes)
    .post(protect, upload.single('file'), uploadNote);

router.route('/:id')
    .get(getNoteById)
    .delete(protect, deleteNote);

router.get('/:id/download', downloadNote);
router.get('/:id/view', viewNote);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
