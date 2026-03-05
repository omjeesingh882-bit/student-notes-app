const Note = require('../models/Note');
const fs = require('fs');
const path = require('path');

// @desc    Upload a new note
// @route   POST /api/notes
// @access  Private
const uploadNote = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { title, subject, semester, description } = req.body;

        const note = await Note.create({
            title,
            subject,
            semester,
            description,
            fileName: req.file.originalname,
            filePath: req.file.path, // This is now the Cloudinary URL
            fileType: req.file.mimetype,
            uploadedBy: req.user._id
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all notes (with search and filter)
// @route   GET /api/notes
// @access  Public
const getNotes = async (req, res) => {
    try {
        const { search, subject, semester } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }

        if (subject) query.subject = { $regex: subject, $options: 'i' };
        if (semester) query.semester = semester;

        const notes = await Note.find(query)
            .populate('uploadedBy', 'username')
            .sort({ createdAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Public
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate('uploadedBy', 'username');

        if (note) {
            res.json(note);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download note and increment count
// @route   GET /api/notes/:id/download
// @access  Public
const downloadNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            note.downloads += 1;
            await note.save();

            // Cloudinary files can be accessed via their URL directly
            // Just redirect user to the Cloudinary raw file URL
            // Optionally, attachment flag can be handled on the frontend or via Cloudinary flags
            return res.redirect(note.filePath);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle like on a note
// @route   POST /api/notes/:id/like
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            const alreadyLiked = note.likes.find(r => r.toString() === req.user._id.toString());

            if (alreadyLiked) {
                note.likes = note.likes.filter(r => r.toString() !== req.user._id.toString());
            } else {
                note.likes.push(req.user._id);
            }

            await note.save();
            res.json(note);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            if (note.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'User not authorized to delete this note' });
            }

            // In a complete implementation you would also call cloudinary.uploader.destroy()
            // with the public_id of the file to remove it from cloud storage.

            await note.deleteOne();
            res.json({ message: 'Note removed' });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    View note in browser
// @route   GET /api/notes/:id/view
// @access  Public
const viewNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            // For Cloudinary files, we just redirect to the Cloudinary URL.
            // Modern browsers will display PDFs inline natively.
            return res.redirect(note.filePath);
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadNote,
    getNotes,
    getNoteById,
    downloadNote,
    viewNote,
    toggleLike,
    deleteNote
};
