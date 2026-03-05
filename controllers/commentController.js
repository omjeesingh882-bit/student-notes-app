const Comment = require('../models/Comment');
const Note = require('../models/Note');

// @desc    Add comment to a note
// @route   POST /api/comments/:noteId
// @access  Private
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const noteId = req.params.noteId;

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const comment = await Comment.create({
            text,
            note: noteId,
            user: req.user._id
        });

        const populatedComment = await Comment.findById(comment._id).populate('user', 'username');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a note
// @route   GET /api/comments/:noteId
// @access  Public
const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ note: req.params.noteId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addComment, getComments };
