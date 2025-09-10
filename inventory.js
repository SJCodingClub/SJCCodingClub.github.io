import { auth, db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, onSnapshot } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeInventoryPage();
});

function initializeInventoryPage() {
    const user = auth.currentUser;
    const farmId = localStorage.getItem('selectedFarm');
    
    if (!user || !farmId) {
        window.location.href = 'settings.html';
        return;
    }
    
    loadInventoryItems(farmId);
    loadCategories(farmId);
    setupEventListeners(farmId);
}

// Load inventory items from Firestore
async function loadInventoryItems(farmId) {
    try {
        const inventoryList = document.getElementById('inventoryList');
        const q = query(collection(db, 'inventory'), where('farmId', '==', farmId));
        
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                inventoryList.innerHTML = '<p>No inventory items added yet. Click "Add Item" to get started.</p>';
                return;
            }
            
            inventoryList.innerHTML = '';
            snapshot.forEach((doc) => {
                const item = doc.data();
                const itemElement = createInventoryElement(doc.id, item);
                inventoryList.appendChild(itemElement);
            });
        });
        
    } catch (error) {
        console.error('Error loading inventory:', error);
        document.getElementById('inventoryList').innerHTML = '<p>Error loading inventory. Please try again.</p>';
    }
}

// Load categories from Firestore
async function loadCategories(farmId) {
    try {
        const categoryFilter = document.getElementById('inventoryCategoryFilter');
        const itemCategory = document.getElementById('itemCategory');
        
        const q = query(collection(db, 'categories'), where('farmId', '==', farmId));
        const querySnapshot = await getDocs(q);
        
        // Clear existing options except the first one
        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        while (itemCategory.options.length > 1) {
            itemCategory.remove(1);
        }
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const category = doc.data();
                
                // Add to filter dropdown
                const filterOption = document.createElement('option');
                filterOption.value = doc.id;
                filterOption.textContent = category.name;
                categoryFilter.appendChild(filterOption);
                
                // Add to item form dropdown
                const formOption = document.createElement('option');
                formOption.value = doc.id;
                formOption.textContent = category.name;
                itemCategory.appendChild(formOption);
            });
        }
        
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Create HTML element for an inventory item
function createInventoryElement(itemId, item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'list-item';
    
    // Determine status based on quantity
    let status = 'in-stock';
    let statusText = 'In Stock';
    if (item.quantity <= 0) {
        status = 'out-of-stock';
        statusText = 'Out of Stock';
    } else if (item.quantity <= item.lowStockThreshold) {
        status = 'low-stock';
        statusText = 'Low Stock';
    }
    
    itemElement.innerHTML = `
        <div class="list-item-info">
            <h3>${item.name}</h3>
            <p>
                <strong>Category:</strong> ${item.categoryName || 'Uncategorized'} | 
                <strong>Quantity:</strong> ${item.quantity} ${item.unit}
            </p>
            <p><strong>Status:</strong> <span class="status-${status}">${statusText}</span></p>
        </div>
        <div class="list-item-actions">
            <button class="btn-secondary edit-item" data-id="${itemId}">Edit</button>
            <button class="btn-secondary delete-item" data-id="${itemId}">Delete</button>
        </div>
    `;
    
    // Add event listeners
    itemElement.querySelector('.edit-item').addEventListener('click', () => editItem(itemId));
    itemElement.querySelector('.delete-item').addEventListener('click', () => deleteItem(itemId));
    
    return itemElement;
}

// Set up event listeners
function setupEventListeners(farmId) {
    // Add category button
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
        openCategoryModal();
    });
    
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', () => {
        openItemModal();
    });
    
    // Category form submission
    document.getElementById('categoryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveCategory(farmId);
    });
    
    // Item form submission
    document.getElementById('itemForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveItem(farmId);
    });
    
    // Cancel buttons
    document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
        closeCategoryModal();
    });
    
    document.getElementById('cancelItemBtn').addEventListener('click', () => {
        closeItemModal();
    });
    
    // Modal close buttons
    document.querySelector('#categoryModal .close').addEventListener('click', () => {
        closeCategoryModal();
    });
    
    document.querySelector('#itemModal .close').addEventListener('click', () => {
        closeItemModal();
    });
    
    // Filter inventory
    document.getElementById('inventoryCategoryFilter').addEventListener('change', () => {
        filterInventory();
    });
    
    document.getElementById('inventoryStatusFilter').addEventListener('change', () => {
        filterInventory();
    });
    
    document.getElementById('inventorySearch').addEventListener('input', () => {
        filterInventory();
    });
}

// Open category modal
function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    
    if (categoryId) {
        title.textContent = 'Edit Category';
        document.getElementById('categoryId').value = categoryId;
        // Load category data would go here
    } else {
        title.textContent = 'Add New Category';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryForm').reset();
    }
    
    modal.style.display = 'block';
}

// Close category modal
function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

// Open item modal
function openItemModal(itemId = null) {
    const modal = document.getElementById('itemModal');
    const title = document.getElementById('itemModalTitle');
    
    if (itemId) {
        title.textContent = 'Edit Item';
        document.getElementById('itemId').value = itemId;
        // Load item data would go here
    } else {
        title.textContent = 'Add New Item';
        document.getElementById('itemId').value = '';
        document.getElementById('itemForm').reset();
    }
    
    modal.style.display = 'block';
}

// Close item modal
function closeItemModal() {
    document.getElementById('itemModal').style.display = 'none';
}

// Save category to Firestore
async function saveCategory(farmId) {
    const categoryId = document.getElementById('categoryId').value;
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        farmId: farmId,
        updatedAt: new Date()
    };
    
    try {
        if (categoryId) {
            // Update existing category
            await updateDoc(doc(db, 'categories', categoryId), categoryData);
        } else {
            // Add new category
            categoryData.createdAt = new Date();
            await addDoc(collection(db, 'categories'), categoryData);
        }
        
        closeCategoryModal();
        // Reload categories
        loadCategories(farmId);
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Error saving category. Please try again.');
    }
}

// Save item to Firestore
async function saveItem(farmId) {
    const itemId = document.getElementById('itemId').value;
    const categoryId = document.getElementById('itemCategory').value;
    
    // Get category name for display
    let categoryName = '';
    try {
        const categoryDoc = await getDocs(doc(db, 'categories', categoryId));
        if (categoryDoc.exists()) {
            categoryName = categoryDoc.data().name;
        }
    } catch (error) {
        console.error('Error getting category name:', error);
    }
    
    const itemData = {
        name: document.getElementById('itemName').value,
        category: categoryId,
        categoryName: categoryName,
        quantity: parseFloat(document.getElementById('itemQuantity').value),
        unit: document.getElementById('itemUnit').value,
        lowStockThreshold: parseFloat(document.getElementById('itemLowStockThreshold').value),
        notes: document.getElementById('itemNotes').value,
        farmId: farmId,
        updatedAt: new Date()
    };
    
    try {
        if (itemId) {
            // Update existing item
            await updateDoc(doc(db, 'inventory', itemId), itemData);
        } else {
            // Add new item
            itemData.createdAt = new Date();
            await addDoc(collection(db, 'inventory'), itemData);
        }
        
        closeItemModal();
    } catch (error) {
        console.error('Error saving item:', error);
        alert('Error saving item. Please try again.');
    }
}

// Edit item
function editItem(itemId) {
    openItemModal(itemId);
}

// Delete item
async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'inventory', itemId));
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
    }
}

// Filter inventory
function filterInventory() {
    const categoryFilter = document.getElementById('inventoryCategoryFilter').value;
    const statusFilter = document.getElementById('inventoryStatusFilter').value;
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    
    const inventoryItems = document.querySelectorAll('.list-item');
    
    inventoryItems.forEach(item => {
        const itemCategory = item.querySelector('.list-item-info p').textContent.toLowerCase();
        const itemName = item.querySelector('.list-item-info h3').textContent.toLowerCase();
        const itemStatus = item.querySelector('.list-item-info p:last-child').textContent.toLowerCase();
        
        const categoryMatch = categoryFilter === 'all' || itemCategory.includes(categoryFilter);
        const statusMatch = statusFilter === 'all' || itemStatus.includes(statusFilter);
        const searchMatch = itemName.includes(searchTerm) || itemCategory.includes(searchTerm);
        
        if (categoryMatch && statusMatch && searchMatch) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}