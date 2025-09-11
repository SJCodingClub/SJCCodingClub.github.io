import { auth, db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, onSnapshot } from './firebase-config.js';

// Initialize the livestock page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeLivestockPage();
});

function initializeLivestockPage() {
    // Check if user is logged in and a farm is selected
    const user = auth.currentUser;
    const farmId = localStorage.getItem('selectedFarm');
    
    if (!user || !farmId) {
        window.location.href = 'settings.html';
        return;
    }
    
    // Load animals
    loadAnimals(farmId);
    
    // Set up event listeners
    setupEventListeners(farmId);
}

// Load animals from Firestore
async function loadAnimals(farmId) {
    try {
        const animalsList = document.getElementById('animalsList');
        const q = query(collection(db, 'livestock'), where('farmId', '==', farmId));
        
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                animalsList.innerHTML = '<p>No animals added yet. Click "Add New Animal" to get started.</p>';
                return;
            }
            
            animalsList.innerHTML = '';
            snapshot.forEach((doc) => {
                const animal = doc.data();
                const animalElement = createAnimalElement(doc.id, animal);
                animalsList.appendChild(animalElement);
            });
        });
        
    } catch (error) {
        console.error('Error loading animals:', error);
        document.getElementById('animalsList').innerHTML = '<p>Error loading animals. Please try again.</p>';
    }
}

// Create HTML element for an animal
function createAnimalElement(animalId, animal) {
    const animalElement = document.createElement('div');
    animalElement.className = 'list-item';
    animalElement.innerHTML = `
        <div class="list-item-info">
            <h3>${animal.idTag} (${animal.type})</h3>
            <p>
                <strong>Breed:</strong> ${animal.breed || 'Unknown'} | 
                <strong>Gender:</strong> ${animal.gender} | 
                <strong>Status:</strong> <span class="status-${animal.status}">${animal.status}</span>
            </p>
            <p><strong>DOB:</strong> ${animal.dob || 'Unknown'} | <strong>Age:</strong> ${calculateAge(animal.dob)}</p>
        </div>
        <div class="list-item-actions">
            <button class="btn-primary view-animal" data-id="${animalId}">View</button>
            <button class="btn-secondary edit-animal" data-id="${animalId}">Edit</button>
            <button class="btn-secondary delete-animal" data-id="${animalId}">Delete</button>
        </div>
    `;
    
    // Add event listeners
    animalElement.querySelector('.view-animal').addEventListener('click', () => viewAnimal(animalId));
    animalElement.querySelector('.edit-animal').addEventListener('click', () => editAnimal(animalId));
    animalElement.querySelector('.delete-animal').addEventListener('click', () => deleteAnimal(animalId));
    
    return animalElement;
}

// Calculate age from date of birth
function calculateAge(dob) {
    if (!dob) return 'Unknown';
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return `${age} years`;
}

// Set up event listeners
function setupEventListeners(farmId) {
    // Add animal button
    document.getElementById('addAnimalBtn').addEventListener('click', () => {
        openAnimalModal();
    });
    
    // Animal form submission
    document.getElementById('animalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveAnimal(farmId);
    });
    
    // Cancel button
    document.getElementById('cancelAnimalBtn').addEventListener('click', () => {
        closeAnimalModal();
    });
    
    // Modal close button
    document.querySelector('#animalModal .close').addEventListener('click', () => {
        closeAnimalModal();
    });
    
    // Filter animals
    document.getElementById('animalTypeFilter').addEventListener('change', () => {
        filterAnimals();
    });
    
    document.getElementById('animalStatusFilter').addEventListener('change', () => {
        filterAnimals();
    });
    
    document.getElementById('animalSearch').addEventListener('input', () => {
        filterAnimals();
    });
}

// Open animal modal for adding a new animal
function openAnimalModal(animalId = null) {
    const modal = document.getElementById('animalModal');
    const title = document.getElementById('animalModalTitle');
    
    if (animalId) {
        // Editing existing animal
        title.textContent = 'Edit Animal';
        document.getElementById('animalId').value = animalId;
        
        // Load animal data
        loadAnimalData(animalId);
    } else {
        // Adding new animal
        title.textContent = 'Add New Animal';
        document.getElementById('animalId').value = '';
        document.getElementById('animalForm').reset();
    }
    
    modal.style.display = 'block';
}

// Close animal modal
function closeAnimalModal() {
    document.getElementById('animalModal').style.display = 'none';
}

// Load animal data for editing
async function loadAnimalData(animalId) {
    try {
        // In a real application, you would fetch the animal data from Firestore
        const animalDoc = await getDocs(doc(db, 'livestock', animalId));
        if (animalDoc.exists()) {
            const animal = animalDoc.data();
            
            // Populate form fields
            document.getElementById('animalType').value = animal.type || '';
            document.getElementById('animalBreed').value = animal.breed || '';
            document.getElementById('animalIdTag').value = animal.idTag || '';
            document.getElementById('animalDob').value = animal.dob || '';
            document.getElementById('animalGender').value = animal.gender || 'unknown';
            document.getElementById('animalStatus').value = animal.status || 'active';
            document.getElementById('animalNotes').value = animal.notes || '';
        }
    } catch (error) {
        console.error('Error loading animal data:', error);
        alert('Error loading animal data. Please try again.');
    }
}

// Save animal to Firestore
async function saveAnimal(farmId) {
    const animalId = document.getElementById('animalId').value;
    const animalData = {
        type: document.getElementById('animalType').value,
        breed: document.getElementById('animalBreed').value,
        idTag: document.getElementById('animalIdTag').value,
        dob: document.getElementById('animalDob').value,
        gender: document.getElementById('animalGender').value,
        status: document.getElementById('animalStatus').value,
        notes: document.getElementById('animalNotes').value,
        farmId: farmId,
        updatedAt: new Date()
    };
    
    try {
        if (animalId) {
            // Update existing animal
            await updateDoc(doc(db, 'livestock', animalId), animalData);
        } else {
            // Add new animal
            animalData.createdAt = new Date();
            await addDoc(collection(db, 'livestock'), animalData);
        }
        
        closeAnimalModal();
    } catch (error) {
        console.error('Error saving animal:', error);
        alert('Error saving animal. Please try again.');
    }
}

// View animal details
function viewAnimal(animalId) {
    // In a real application, you would show a detailed view of the animal
    // This could include health records, breeding history, etc.
    alert(`View animal details for ${animalId}`);
}

// Edit animal
async function editAnimal(animalId) {
    openAnimalModal(animalId);
}

// Delete animal
async function deleteAnimal(animalId) {
    if (!confirm('Are you sure you want to delete this animal? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'livestock', animalId));
    } catch (error) {
        console.error('Error deleting animal:', error);
        alert('Error deleting animal. Please try again.');
    }
}

// Filter animals based on type, status and search term
function filterAnimals() {
    const typeFilter = document.getElementById('animalTypeFilter').value;
    const statusFilter = document.getElementById('animalStatusFilter').value;
    const searchTerm = document.getElementById('animalSearch').value.toLowerCase();
    
    const animalItems = document.querySelectorAll('.list-item');
    
    animalItems.forEach(item => {
        const animalInfo = item.querySelector('.list-item-info').textContent.toLowerCase();
        const animalName = item.querySelector('.list-item-info h3').textContent.toLowerCase();
        
        const typeMatch = typeFilter === 'all' || animalInfo.includes(typeFilter);
        const statusMatch = statusFilter === 'all' || animalInfo.includes(statusFilter);
        const searchMatch = animalName.includes(searchTerm) || animalInfo.includes(searchTerm);
        
        if (typeMatch && statusMatch && searchMatch) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}