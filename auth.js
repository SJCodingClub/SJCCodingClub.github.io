import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    updatePassword,
    updateProfile,
    db,
    collection,
    addDoc,
    getDocs,
    query,
    where
} from './firebase-config.js';

// Check if user is logged in and redirect if necessary
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.uid);
        
        // Update UI to show user is logged in
        const userElements = document.querySelectorAll('#currentUser');
        if (userElements.length > 0) {
            userElements.forEach(element => {
                element.textContent = `Welcome, ${user.displayName || user.email}`;
            });
        }
        
        // Redirect from auth pages to dashboard if already logged in
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            window.location.href = 'index.html';
        }
        
        // Load user's farms
        loadFarms(user.uid);
        
    } else {
        // User is signed out
        console.log('User is signed out');
        
        // Redirect to login if trying to access protected pages
        if (currentPage !== 'login.html' && currentPage !== 'register.html') {
            window.location.href = 'login.html';
        }
    }
});

// Register functionality
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showMessage(registerMessage, 'Passwords do not match', 'error');
            return;
        }
        
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Update user profile with name
            await updateProfile(user, {
                displayName: name
            });
            
            // Create a default farm for the user
            await addDoc(collection(db, 'farms'), {
                userId: user.uid,
                name: `${name}'s Farm`,
                createdAt: new Date()
            });
            
            showMessage(registerMessage, 'Account created successfully! Redirecting...', 'success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error creating account:', error);
            showMessage(registerMessage, error.message, 'error');
        }
    });
}

// Login functionality
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            console.error('Error signing in:', error);
            showMessage(loginMessage, error.message, 'error');
        }
    });
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });
}

// Load user's farms
async function loadFarms(userId) {
    const farmsList = document.getElementById('farmsList');
    if (!farmsList) return;
    
    try {
        const q = query(collection(db, 'farms'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            farmsList.innerHTML = '<p>No farms created yet.</p>';
            return;
        }
        
        farmsList.innerHTML = '';
        querySnapshot.forEach((doc) => {
            const farm = doc.data();
            const farmElement = document.createElement('div');
            farmElement.className = 'list-item';
            farmElement.innerHTML = `
                <div class="list-item-info">
                    <h3>${farm.name}</h3>
                    <p>Created: ${farm.createdAt.toDate().toLocaleDateString()}</p>
                </div>
                <div class="list-item-actions">
                    <button class="btn-primary select-farm" data-id="${doc.id}">Select</button>
                    <button class="btn-secondary edit-farm" data-id="${doc.id}">Edit</button>
                    <button class="btn-secondary delete-farm" data-id="${doc.id}">Delete</button>
                </div>
            `;
            farmsList.appendChild(farmElement);
        });
        
        // Add event listeners for farm actions
        document.querySelectorAll('.select-farm').forEach(button => {
            button.addEventListener('click', (e) => {
                const farmId = e.target.getAttribute('data-id');
                selectFarm(farmId);
            });
        });
        
        document.querySelectorAll('.edit-farm').forEach(button => {
            button.addEventListener('click', (e) => {
                const farmId = e.target.getAttribute('data-id');
                editFarm(farmId);
            });
        });
        
        document.querySelectorAll('.delete-farm').forEach(button => {
            button.addEventListener('click', (e) => {
                const farmId = e.target.getAttribute('data-id');
                deleteFarm(farmId);
            });
        });
        
    } catch (error) {
        console.error('Error loading farms:', error);
        farmsList.innerHTML = '<p>Error loading farms. Please try again.</p>';
    }
}

// Select farm function
function selectFarm(farmId) {
    localStorage.setItem('selectedFarm', farmId);
    
    const farmElements = document.querySelectorAll('#currentFarm');
    if (farmElements.length > 0) {
        // We'll update the farm name in the main.js after loading farm details
        farmElements.forEach(element => {
            element.textContent = 'Loading farm...';
        });
    }
    
    // Reload the page to reflect the selected farm
    window.location.reload();
}

// Edit farm function
function editFarm(farmId) {
    // This will be implemented in settings.js
    console.log('Edit farm:', farmId);
}

// Delete farm function
async function deleteFarm(farmId) {
    if (!confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
        return;
    }
    
    try {
        // In a real application, you would also need to delete all related data
        // (crops, livestock, etc.) or implement cascading deletes
        await deleteDoc(doc(db, 'farms', farmId));
        
        // If the deleted farm was selected, clear the selection
        if (localStorage.getItem('selectedFarm') === farmId) {
            localStorage.removeItem('selectedFarm');
        }
        
        // Reload the farms list
        loadFarms(auth.currentUser.uid);
        
    } catch (error) {
        console.error('Error deleting farm:', error);
        alert('Error deleting farm. Please try again.');
    }
}

// Helper function to show messages
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Clear message after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Export functions for use in other modules
export { loadFarms, selectFarm };