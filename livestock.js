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
        document.getElementById('animalId').value = animalId