import { auth, db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeSettingsPage();
});

function initializeSettingsPage() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    setupEventListeners();
    loadUserProfile();
}

function setupEventListeners() {
    // Add farm button
    document.getElementById('addFarmBtn').addEventListener('click', () => {
        openFarmModal();
    });
    
    // Farm form submission
    document.getElementById('farmForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveFarm();
    });
    
    // Cancel button
    document.getElementById('cancelFarmBtn').addEventListener('click', () => {
        closeFarmModal();
    });
    
    // Modal close button
    document.querySelector('#farmModal .close').addEventListener('click', () => {
        closeFarmModal();
    });
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        updateProfile();
    });
    
    // Password form submission
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        changePassword();
    });
}

// Open farm modal
function openFarmModal(farmId = null) {
    const modal = document.getElementById('farmModal');
    const title = document.getElementById('farmModalTitle');
    
    if (farmId) {
        title.textContent = 'Edit Farm';
        document.getElementById('farmId').value = farmId;
        // Load farm data would go here
    } else {
        title.textContent = 'Add New Farm';
        document.getElementById('farmId').value = '';
        document.getElementById('farmForm').reset();
    }
    
    modal.style.display = 'block';
}

// Close farm modal
function closeFarmModal() {
    document.getElementById('farmModal').style.display = 'none';
}

// Save farm to Firestore
async function saveFarm() {
    const farmId = document.getElementById('farmId').value;
    const farmData = {
        name: document.getElementById('farmName').value,
        address: document.getElementById('farmAddress').value,
        size: parseFloat(document.getElementById('farmSize').value) || 0,
        description: document.getElementById('farmDescription').value,
        userId: auth.currentUser.uid,
        updatedAt: new Date()
    };
    
    try {
        if (farmId) {
            // Update existing farm
            await updateDoc(doc(db, 'farms', farmId), farmData);
        } else {
            // Add new farm
            farmData.createdAt = new Date();
            await addDoc(collection(db, 'farms'), farmData);
        }
        
        closeFarmModal();
        // Reload farms list
        // This would call a function to refresh the farms list
    } catch (error) {
        console.error('Error saving farm:', error);
        alert('Error saving farm. Please try again.');
    }
}

// Load user profile
async function loadUserProfile() {
    const user = auth.currentUser;
    if (user) {
        document.getElementById('userName').value = user.displayName || '';
        document.getElementById('userEmail').value = user.email || '';
        // Phone number would need to be stored in Firestore
    }
}

// Update user profile
async function updateProfile() {
    const user = auth.currentUser;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    
    try {
        await updateProfile(user, {
            displayName: name
        });
        
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
    }
}

// Change password
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return;
    }
    
    try {
        await updatePassword(auth.currentUser, newPassword);
        alert('Password changed successfully!');
        document.getElementById('passwordForm').reset();
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password. Please try again.');
    }
}