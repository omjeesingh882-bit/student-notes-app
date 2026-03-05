const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.route('/:noteId')
    .post(protect, addComment)
    .get(getComments);

module.exports = router;
