const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
let token = '';
let noteId = '';

async function runTests() {
    console.log('--- Starting API Tests ---');

    // 1. Register
    console.log('1. Registering new user...');
    try {
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: `testuser_${Date.now()}`,
                email: `test_${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.message);
        token = regData.token;
        console.log('✅ Registration successful. Token received.');

        // Create a dummy file for upload
        const dummyFilePath = path.join(__dirname, 'dummy.txt');
        fs.writeFileSync(dummyFilePath, 'This is a test document.');

        // Let's create a dummy pdf so multer accepts it based on extension
        const pdfFilePath = path.join(__dirname, 'dummy.pdf');
        fs.writeFileSync(pdfFilePath, '%PDF-1.4... dummy content');

        // 2. Upload Note
        console.log('\n2. Uploading a note...');
        const formData = new FormData();
        formData.append('title', 'Test Note');
        formData.append('subject', 'Computer Science');
        formData.append('semester', '1');
        formData.append('description', 'This is a test note description.');
        formData.append('file', fs.createReadStream(pdfFilePath));

        const uploadRes = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message);
        noteId = uploadData._id;
        console.log('✅ Note uploaded successfully. ID:', noteId);

        // 3. Get All Notes (Verify upload)
        console.log('\n3. Fetching all notes...');
        const getRes = await fetch(`${API_URL}/notes`);
        const getData = await getRes.json();
        if (!getRes.ok) throw new Error(getData.message);
        if (getData.some(n => n._id === noteId)) {
            console.log('✅ Fetch successful. New note found in list.');
        } else {
            throw new Error('Newly appended note missing from list.');
        }

        // 4. Like Note
        console.log('\n4. Liking the note...');
        const likeRes = await fetch(`${API_URL}/notes/${noteId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const likeData = await likeRes.json();
        if (!likeRes.ok) throw new Error(likeData.message);
        if (likeData.likes.length === 1) {
            console.log('✅ Liking successful.');
        } else {
            throw new Error('Liking failed. Likes array length is ' + likeData.likes.length);
        }

        // 5. Add Comment
        console.log('\n5. Adding a comment...');
        const commentRes = await fetch(`${API_URL}/comments/${noteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: 'This is a great test note!' })
        });
        const commentData = await commentRes.json();
        if (!commentRes.ok) throw new Error(commentData.message);
        console.log('✅ Comment added successfully.');

        // 6. Delete Note
        console.log('\n6. Deleting the note...');
        const deleteRes = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const deleteData = await deleteRes.json();
        if (!deleteRes.ok) throw new Error(deleteData.message);
        console.log('✅ Delete successful.');

        // Cleanup
        if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);
        if (fs.existsSync(pdfFilePath)) fs.unlinkSync(pdfFilePath);

        console.log('\n🎉 ALL TESTS PASSED 🎉');
    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
    }
}

runTests();
