// State
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// DOM Elements
const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const unauthLinks = document.getElementById('unauth-links');
const authLinks = document.getElementById('auth-links');
const navUsername = document.getElementById('nav-username');
const mainContent = document.getElementById('main-content');
const navAdmin = document.getElementById('nav-admin');

// Modals
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const uploadModal = document.getElementById('upload-modal');

// Buttons
const btnLoginModal = document.getElementById('btn-login-modal');
const btnRegisterModal = document.getElementById('btn-register-modal');
const btnLogout = document.getElementById('btn-logout');
const btnUploadModal = document.getElementById('btn-upload-modal');
const navDashboard = document.getElementById('nav-dashboard');
const headerSearchBtn = document.getElementById('header-search-btn');
const headerSearchInput = document.getElementById('header-search-input');

// Forms
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const uploadForm = document.getElementById('upload-form');

// Initialize
function init() {
    initTheme();
    updateNav();
    attachEventListeners();
    loadHomepage();
}

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

// Navigation & Auth State
function updateNav() {
    if (currentUser) {
        unauthLinks.classList.add('hidden');
        authLinks.classList.remove('hidden');
        navUsername.textContent = currentUser.username;
        if (currentUser.role === 'admin') {
            navAdmin.classList.remove('hidden');
        } else {
            navAdmin.classList.add('hidden');
        }
    } else {
        unauthLinks.classList.remove('hidden');
        authLinks.classList.add('hidden');
        navAdmin.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    updateNav();
    loadHomepage();
}

// Event Listeners
function attachEventListeners() {
    // Theme
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Modals
    btnLoginModal.addEventListener('click', () => showModal(loginModal));
    btnRegisterModal.addEventListener('click', () => showModal(registerModal));
    if (btnUploadModal) btnUploadModal.addEventListener('click', () => showModal(uploadModal));
    if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); loadDashboard(); });
    if (navAdmin) navAdmin.addEventListener('click', (e) => { e.preventDefault(); loadAdminPanel(); });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            hideModal(e.target.closest('.modal'));
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });

    // Auth Actions
    btnLogout.addEventListener('click', logout);

    // Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    uploadForm.addEventListener('submit', handleUpload);

    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', () => searchNotes(headerSearchInput.value));
        headerSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchNotes(headerSearchInput.value);
        });
    }

    // Default logo click
    document.getElementById('nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        loadHomepage();
    });
}

// Modal Helpers
function showModal(modal) {
    modal.classList.remove('hidden');
}

function hideModal(modal) {
    modal.classList.add('hidden');
    const form = modal.querySelector('form');
    if (form) form.reset();
}

// Auth Handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const user = await window.api.login({ email, password });
        currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        updateNav();
        hideModal(loginModal);
        alert('Login successful');
        loadHomepage();
    } catch (error) {
        alert(error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const user = await window.api.register({ username, email, password });
        currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        updateNav();
        hideModal(registerModal);
        alert('Registration successful');
        loadHomepage();
    } catch (error) {
        alert(error.message);
    }
}

function getFileIcon(fileType) {
    if (fileType.includes('pdf')) return '<i class="fa-solid fa-file-pdf" style="color: #ef4444;"></i>';
    if (fileType.includes('word') || fileType.includes('doc')) return '<i class="fa-solid fa-file-word" style="color: #2563eb;"></i>';
    if (fileType.includes('powerpoint') || fileType.includes('ppt')) return '<i class="fa-solid fa-file-powerpoint" style="color: #f97316;"></i>';
    return '<i class="fa-solid fa-file"></i>';
}

function renderNoteCard(note) {
    return `
        <div class="card note-card" data-id="${note._id}">
            <div class="card-header">
                <div class="note-icon">${getFileIcon(note.fileType)}</div>
                <h3 class="note-title">${note.title}</h3>
            </div>
            <div class="card-body">
                <p class="note-subject"><i class="fa-solid fa-book"></i> ${note.subject}</p>
                <p class="note-semester"><i class="fa-solid fa-graduation-cap"></i> Semester ${note.semester}</p>
                <p class="note-desc">${note.description.length > 60 ? note.description.substring(0, 60) + '...' : note.description}</p>
            </div>
            <div class="card-footer">
                <div class="note-meta">
                    <span><i class="fa-solid fa-user"></i> ${note.uploadedBy?.username || 'Unknown'}</span>
                    <span><i class="fa-solid fa-download"></i> ${note.downloads}</span>
                </div>
                <button class="btn btn-primary btn-sm btn-view-note" onclick="viewNoteDetails('${note._id}')">View</button>
            </div>
        </div>
    `;
}

// View Routing Simple Implementation
async function loadHomepage() {
    mainContent.innerHTML = `
        <div class="hero-section text-center">
            <h1>Welcome to NoteShare</h1>
            <p>Find and share study notes with ease.</p>
        </div>
        
        <div class="container section">
            <div class="section-header">
                <h2>Top Downloaded Notes</h2>
            </div>
            <div id="top-notes-grid" class="notes-grid">
                <div class="loader">Loading...</div>
            </div>
        </div>

        <div class="container section">
            <div class="section-header">
                <h2>Recently Uploaded</h2>
            </div>
            <div id="recent-notes-grid" class="notes-grid">
                <div class="loader">Loading...</div>
            </div>
        </div>
    `;

    try {
        const notes = await window.api.getNotes();

        // top downloaded (sort by downloads)
        const topNotes = [...notes].sort((a, b) => b.downloads - a.downloads).slice(0, 4);

        // recently uploaded (sort by createdAt) -> the API already sorts by createdAt -1
        const recentNotes = notes.slice(0, 8);

        const topGrid = document.getElementById('top-notes-grid');
        const recentGrid = document.getElementById('recent-notes-grid');

        topGrid.innerHTML = topNotes.length
            ? topNotes.map(n => renderNoteCard(n)).join('')
            : '<p>No notes found.</p>';

        recentGrid.innerHTML = recentNotes.length
            ? recentNotes.map(n => renderNoteCard(n)).join('')
            : '<p>No notes found.</p>';

    } catch (error) {
        console.error(error);
        document.getElementById('recent-notes-grid').innerHTML = '<p>Error loading notes.</p>';
        document.getElementById('top-notes-grid').innerHTML = '<p>Error loading notes.</p>';
    }
}

async function handleUpload(e) {
    e.preventDefault();
    if (!currentUser) return alert('Please login to upload notes.');

    const formData = new FormData();
    formData.append('title', document.getElementById('up-title').value);
    formData.append('subject', document.getElementById('up-subject').value);
    formData.append('semester', document.getElementById('up-semester').value);
    formData.append('description', document.getElementById('up-desc').value);
    formData.append('file', document.getElementById('up-file').files[0]);

    try {
        await window.api.uploadNote(formData, currentUser.token);
        hideModal(uploadModal);
        alert('Note uploaded successfully!');
        loadDashboard();
    } catch (error) {
        alert(error.message);
    }
}

async function loadDashboard() {
    if (!currentUser) return;

    mainContent.innerHTML = `
        <div class="container section">
            <div class="section-header">
                <h2>My Dashboard</h2>
                <button class="btn btn-primary" onclick="showModal(uploadModal)"><i class="fa-solid fa-plus"></i> Upload New</button>
            </div>
            <div id="dashboard-grid" class="notes-grid">
                <div class="loader">Loading your notes...</div>
            </div>
        </div>
    `;

    try {
        const notes = await window.api.getUserDashboard(currentUser.token);
        const grid = document.getElementById('dashboard-grid');
        grid.innerHTML = notes.length
            ? notes.map(n => renderNoteCard(n)).join('')
            : '<p>You have not uploaded any notes yet.</p>';
    } catch (error) {
        document.getElementById('dashboard-grid').innerHTML = '<p>Error loading dashboard.</p>';
        console.error(error);
    }
}

async function searchNotes(query) {
    if (!query) return loadHomepage();

    mainContent.innerHTML = `
        <div class="container section">
            <div class="section-header">
                <h2>Search Results for "${query}"</h2>
            </div>
            <div id="search-grid" class="notes-grid">
                <div class="loader">Searching...</div>
            </div>
        </div>
    `;

    try {
        const notes = await window.api.getNotes(`?search=${encodeURIComponent(query)}`);
        const grid = document.getElementById('search-grid');
        grid.innerHTML = notes.length
            ? notes.map(n => renderNoteCard(n)).join('')
            : '<p>No notes found matching your search.</p>';
    } catch (error) {
        document.getElementById('search-grid').innerHTML = '<p>Error searching notes.</p>';
    }
}

let currentNoteId = null;

async function viewNoteDetails(noteId) {
    const modal = document.getElementById('note-details-modal');
    showModal(modal);
    currentNoteId = noteId;

    document.getElementById('detail-title').textContent = "Loading...";
    document.getElementById('comments-list').innerHTML = '<div class="loader">Loading comments...</div>';

    try {
        const note = await window.api.getNoteDetails(noteId);

        document.getElementById('detail-title').textContent = note.title;
        document.getElementById('detail-meta').textContent = `Uploaded by ${note.uploadedBy?.username || 'Unknown'} on ${new Date(note.createdAt).toLocaleDateString()}`;
        document.getElementById('detail-subject').textContent = note.subject;
        document.getElementById('detail-semester').textContent = note.semester;
        document.getElementById('detail-desc').textContent = note.description;
        document.getElementById('detail-downloads').textContent = note.downloads;
        document.getElementById('detail-likes').textContent = note.likes ? note.likes.length : 0;

        // Action buttons
        const btnDownload = document.getElementById('btn-download');
        btnDownload.onclick = () => window.api.downloadNote(note._id);

        const btnView = document.getElementById('btn-view-pdf');
        if (note.fileType.includes('pdf')) {
            btnView.classList.remove('hidden');
            btnView.onclick = () => window.api.viewNote(note._id);
        } else {
            btnView.classList.add('hidden');
        }

        const btnLike = document.getElementById('btn-like');
        btnLike.onclick = async () => {
            if (!currentUser) return alert('Login required to like notes.');
            try {
                const updatedNote = await window.api.toggleLike(note._id, currentUser.token);
                document.getElementById('detail-likes').textContent = updatedNote.likes.length;
            } catch (err) { alert(err.message); }
        };

        const btnDelete = document.getElementById('btn-delete-note');
        if (currentUser && (currentUser._id === note.uploadedBy._id || currentUser.role === 'admin')) {
            btnDelete.classList.remove('hidden');
            btnDelete.onclick = async () => {
                if (confirm('Are you sure you want to delete this note?')) {
                    await window.api.deleteNote(note._id, currentUser.token);
                    hideModal(modal);
                    alert('Note deleted');
                    loadHomepage();
                }
            };
        } else {
            btnDelete.classList.add('hidden');
        }

        // Handle Comments
        loadComments(noteId);

        const commentForm = document.getElementById('comment-form');
        const loginMsg = document.getElementById('comment-login-msg');

        if (currentUser) {
            commentForm.classList.remove('hidden');
            loginMsg.classList.add('hidden');

            // Remove previous listeners to prevent duplicates
            const newForm = commentForm.cloneNode(true);
            commentForm.parentNode.replaceChild(newForm, commentForm);

            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const text = document.getElementById('comment-input').value;
                try {
                    await window.api.addComment(noteId, text, currentUser.token);
                    document.getElementById('comment-input').value = '';
                    loadComments(noteId);
                } catch (err) { alert(err.message); }
            });
        } else {
            commentForm.classList.add('hidden');
            loginMsg.classList.remove('hidden');
        }

    } catch (error) {
        console.error(error);
        alert('Failed to load note details');
        hideModal(modal);
    }
}

async function loadComments(noteId) {
    try {
        const comments = await window.api.getComments(noteId);
        const list = document.getElementById('comments-list');
        list.innerHTML = comments.length ? comments.map(c => `
            <div style="margin-bottom: 10px; padding: 10px; background: var(--bg-color); border-radius: var(--radius);">
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);"><strong>${c.user?.username || 'Unknown'}</strong> - ${new Date(c.createdAt).toLocaleDateString()}</p>
                <p style="margin: 5px 0 0; color: var(--text-color);">${c.text}</p>
            </div>
        `).join('') : '<p>No comments yet. Be the first!</p>';
    } catch (error) {
        document.getElementById('comments-list').innerHTML = '<p>Error loading comments.</p>';
    }
}

async function loadAdminPanel() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Unauthorized access');
        return loadHomepage();
    }

    mainContent.innerHTML = `
        <div class="container section">
            <div class="section-header">
                <h2>Admin Control Panel</h2>
            </div>
            <p>Manage all notes on the platform.</p>
            <div id="admin-grid" class="notes-grid mt-2">
                <div class="loader">Loading all notes...</div>
            </div>
        </div>
    `;

    try {
        const notes = await window.api.getNotes();
        const grid = document.getElementById('admin-grid');
        grid.innerHTML = notes.length
            ? notes.map(n => renderNoteCard(n)).join('')
            : '<p>No notes exist on the platform.</p>';
    } catch (error) {
        document.getElementById('admin-grid').innerHTML = '<p>Error loading admin panel.</p>';
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', init);
