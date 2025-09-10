import { auth, db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, onSnapshot } from './firebase-config.js';

// Initialize the crops page when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCropsPage();
});

function initializeCropsPage() {
    // Check if user is logged in and a farm is selected
    const user = auth.currentUser;
    const farmId = localStorage.getItem('selectedFarm');
    
    if (!user || !farmId) {
        window.location.href = 'settings.html';
        return;
    }
    
    // Load fields
    loadFields(farmId);
    
    // Set up event listeners
    setupEventListeners(farmId);
}

// Load fields from Firestore
async function loadFields(farmId) {
    try {
        const fieldsList = document.getElementById('fieldsList');
        const q = query(collection(db, 'fields'), where('farmId', '==', farmId));
        
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                fieldsList.innerHTML = '<p>No fields added yet. Click "Add New Field" to get started.</p>';
                return;
            }
            
            fieldsList.innerHTML = '';
            snapshot.forEach((doc) => {
                const field = doc.data();
                const fieldElement = createFieldElement(doc.id, field);
                fieldsList.appendChild(fieldElement);
            });
        });
        
    } catch (error) {
        console.error('Error loading fields:', error);
        document.getElementById('fieldsList').innerHTML = '<p>Error loading fields. Please try again.</p>';
    }
}

// Create HTML element for a field
function createFieldElement(fieldId, field) {
    const fieldElement = document.createElement('div');
    fieldElement.className = 'list-item';
    fieldElement.innerHTML = `
        <div class="list-item-info">
            <h3>${field.name}</h3>
            <p>
                <strong>Crop:</strong> ${field.cropType} | 
                <strong>Size:</strong> ${field.size} acres | 
                <strong>Status:</strong> <span class="status-${field.status}">${field.status}</span>
            </p>
            <p><strong>Planted:</strong> ${field.plantingDate || 'Not set'} | <strong>Harvest:</strong> ${field.harvestDate || 'Not set'}</p>
        </div>
        <div class="list-item-actions">
            <button class="btn-primary view-field" data-id="${fieldId}">View</button>
            <button class="btn-secondary edit-field" data-id="${fieldId}">Edit</button>
            <button class="btn-secondary delete-field" data-id="${fieldId}">Delete</button>
        </div>
    `;
    
    // Add event listeners
    fieldElement.querySelector('.view-field').addEventListener('click', () => viewField(fieldId));
    fieldElement.querySelector('.edit-field').addEventListener('click', () => editField(fieldId));
    fieldElement.querySelector('.delete-field').addEventListener('click', () => deleteField(fieldId));
    
    return fieldElement;
}

// Set up event listeners
function setupEventListeners(farmId) {
    // Add field button
    document.getElementById('addFieldBtn').addEventListener('click', () => {
        openFieldModal();
    });
    
    // Field form submission
    document.getElementById('fieldForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveField(farmId);
    });
    
    // Cancel button
    document.getElementById('cancelFieldBtn').addEventListener('click', () => {
        closeFieldModal();
    });
    
    // Modal close button
    document.querySelector('#fieldModal .close').addEventListener('click', () => {
        closeFieldModal();
    });
    
    // Filter fields
    document.getElementById('cropStatusFilter').addEventListener('change', () => {
        filterFields();
    });
    
    document.getElementById('cropSearch').addEventListener('input', () => {
        filterFields();
    });
}

// Open field modal for adding a new field
function openFieldModal(fieldId = null) {
    const modal = document.getElementById('fieldModal');
    const title = document.getElementById('fieldModalTitle');
    
    if (fieldId) {
        // Editing existing field
        title.textContent = 'Edit Field';
        document.getElementById('fieldId').value = fieldId;
        
        // Load field data (in a real application, you would fetch from Firestore)
        // For now, we'll just clear the form
        document.getElementById('fieldForm').reset();
    } else {
        // Adding new field
        title.textContent = 'Add New Field';
        document.getElementById('fieldId').value = '';
        document.getElementById('fieldForm').reset();
    }
    
    modal.style.display = 'block';
}

// Close field modal
function closeFieldModal() {
    document.getElementById('fieldModal').style.display = 'none';
}

// Save field to Firestore
async function saveField(farmId) {
    const fieldId = document.getElementById('fieldId').value;
    const fieldData = {
        name: document.getElementById('fieldName').value,
        size: parseFloat(document.getElementById('fieldSize').value),
        cropType: document.getElementById('cropType').value,
        plantingDate: document.getElementById('plantingDate').value,
        harvestDate: document.getElementById('harvestDate').value,
        status: document.getElementById('fieldStatus').value,
        notes: document.getElementById('fieldNotes').value,
        farmId: farmId,
        updatedAt: new Date()
    };
    
    try {
        if (fieldId) {
            // Update existing field
            await updateDoc(doc(db, 'fields', fieldId), fieldData);
        } else {
            // Add new field
            fieldData.createdAt = new Date();
            await addDoc(collection(db, 'fields'), fieldData);
        }
        
        closeFieldModal();
    } catch (error) {
        console.error('Error saving field:', error);
        alert('Error saving field. Please try again.');
    }
}

// View field details
function viewField(fieldId) {
    // In a real application, you would show a detailed view of the field
    alert(`View field details for ${fieldId}`);
}

// Edit field
async function editField(fieldId) {
    try {
        // In a real application, you would fetch the field data from Firestore
        // and populate the form
        openFieldModal(fieldId);
    } catch (error) {
        console.error('Error loading field for editing:', error);
        alert('Error loading field data. Please try again.');
    }
}

// Delete field
async function deleteField(fieldId) {
    if (!confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'fields', fieldId));
    } catch (error) {
        console.error('Error deleting field:', error);
        alert('Error deleting field. Please try again.');
    }
}

// Filter fields based on status and search term
function filterFields() {
    const statusFilter = document.getElementById('cropStatusFilter').value;
    const searchTerm = document.getElementById('cropSearch').value.toLowerCase();
    
    const fieldItems = document.querySelectorAll('.list-item');
    
    fieldItems.forEach(item => {
        const fieldStatus = item.querySelector('.list-item-info p').textContent.toLowerCase();
        const fieldName = item.querySelector('.list-item-info h3').textContent.toLowerCase();
        
        const statusMatch = statusFilter === 'all' || fieldStatus.includes(statusFilter);
        const searchMatch = fieldName.includes(searchTerm) || fieldStatus.includes(searchTerm);
        
        if (statusMatch && searchMatch) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}