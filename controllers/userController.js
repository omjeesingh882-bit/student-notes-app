const Note = require('../models/Note');

// @desc    Get user dashboard notes
// @route   GET /api/users/dashboard
// @access  Private
const getUserDashboard = async (req, res) => {
    try {
        const notes = await Note.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserDashboard };
