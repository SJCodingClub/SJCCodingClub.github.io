// crops.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    initModals();
    
    // Add event listeners
    document.getElementById('add-crop-btn').addEventListener('click', function() {
        document.getElementById('add-crop-modal').classList.add('active');
    });
    
    document.querySelector('.filter-btn').addEventListener('click', function() {
        document.getElementById('filter-modal').classList.add('active');
    });
    
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Initialize forms
    document.getElementById('add-crop-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addCrop();
    });
    
    document.getElementById('filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });
    
    document.querySelector('.reset-btn').addEventListener('click', function() {
        document.getElementById('filter-form').reset();
        resetFilters();
    });
    
    // Initialize pagination
    document.getElementById('next-page').addEventListener('click', function() {
        nextPage();
    });
    
    document.getElementById('prev-page').addEventListener('click', function() {
        prevPage();
    });
    
    document.querySelectorAll('.page-btn').forEach(button => {
        button.addEventListener('click', function() {
            goToPage(parseInt(this.textContent));
        });
    });
    
    // Load initial data
    loadCrops();
});

function initModals() {
    // Close buttons
    const closeButtons = document.querySelectorAll('.close-btn, .cancel-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('active');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function loadCrops(page = 1) {
    // Here you would typically fetch data from your server
    // For demo purposes, let's use hardcoded data
    const crops = [
        { id: 1, name: 'Wheat', field: 'Field A', plantedDate: '2023-05-15', harvestDate: '2023-08-30', status: 'Growing' },
        { id: 2, name: 'Corn', field: 'Field B', plantedDate: '2023-06-05', harvestDate: '2023-09-20', status: 'Irrigating' },
        { id: 3, name: 'Tomatoes', field: 'Greenhouse 1', plantedDate: '2023-07-10', harvestDate: '2023-09-05', status: 'Flowering' },
        { id: 4, name: 'Potatoes', field: 'Field C', plantedDate: '2023-04-20', harvestDate: '2023-08-15', status: 'Growing' },
        { id: 5, name: 'Soybeans', field: 'Field D', plantedDate: '2023-05-10', harvestDate: '2023-09-25', status: 'Growing' },
        { id: 6, name: 'Carrots', field: 'Greenhouse 2', plantedDate: '2023-06-15', harvestDate: '2023-08-20', status: 'Growing' },
        { id: 7, name: 'Lettuce', field: 'Greenhouse 1', plantedDate: '2023-07-05', harvestDate: '2023-08-10', status: 'Harvesting' },
        { id: 8, name: 'Barley', field: 'Field E', plantedDate: '2023-04-10', harvestDate: '2023-07-30', status: 'Harvested' },
        { id: 9, name: 'Rice', field: 'Field F', plantedDate: '2023-05-20', harvestDate: '2023-09-10', status: 'Irrigating' },
        { id: 10, name: 'Cucumbers', field: 'Greenhouse 3', plantedDate: '2023-06-10', harvestDate: '2023-08-05', status: 'Harvesting' },
        { id: 11, name: 'Bell Peppers', field: 'Greenhouse 2', plantedDate: '2023-06-20', harvestDate: '2023-09-01', status: 'Flowering' },
        { id: 12, name: 'Eggplant', field: 'Greenhouse 3', plantedDate: '2023-06-25', harvestDate: '2023-09-05', status: 'Growing' },
        { id: 13, name: 'Oats', field: 'Field G', plantedDate: '2023-04-15', harvestDate: '2023-08-01', status: 'Harvested' },
        { id: 14, name: 'Rye', field: 'Field H', plantedDate: '2023-04-25', harvestDate: '2023-08-10', status: 'Harvesting' },
        { id: 15, name: 'Spinach', field: 'Greenhouse 1', plantedDate: '2023-07-01', harvestDate: '2023-08-15', status: 'Growing' },
        { id: 16, name: 'Broccoli', field: 'Greenhouse 2', plantedDate: '2023-06-05', harvestDate: '2023-08-20', status: 'Growing' },
        { id: 17, name: 'Cauliflower', field: 'Greenhouse 3', plantedDate: '2023-06-10', harvestDate: '2023-08-25', status: 'Growing' },
        { id: 18, name: 'Onions', field: 'Field I', plantedDate: '2023-05-05', harvestDate: '2023-09-15', status: 'Growing' },
        { id: 19, name: 'Garlic', field: 'Field I', plantedDate: '2023-05-10', harvestDate: '2023-09-20', status: 'Growing' },
        { id: 20, name: 'Sweet Potatoes', field: 'Field C', plantedDate: '2023-05-15', harvestDate: '2023-09-25', status: 'Growing' },
        { id: 21, name: 'Pumpkins', field: 'Field J', plantedDate: '2023-06-01', harvestDate: '2023-10-15', status: 'Growing' },
        { id: 22, name: 'Watermelons', field: 'Field K', plantedDate: '2023-06-05', harvestDate: '2023-09-10', status: 'Growing' },
        { id: 23, name: 'Cantaloupes', field: 'Field K', plantedDate: '2023-06-10', harvestDate: '2023-09-05', status: 'Growing' },
        { id: 24, name: 'Peas', field: 'Greenhouse 1', plantedDate: '2023-07-15', harvestDate: '2023-09-01', status: 'Planted' }
    ];
    
    // Calculate pagination
    const itemsPerPage = 10;
    const totalPages = Math.ceil(crops.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, crops.length);
    
    // Update pagination UI
    document.getElementById('start-record').textContent = startIndex + 1;
    document.getElementById('end-record').textContent = endIndex;
    document.getElementById('total-records').textContent = crops.length;
    
    // Update page buttons
    updatePaginationButtons(page, totalPages);
    
    // Get the crops for current page
    const currentPageCrops = crops.slice(startIndex, endIndex);
    
    // Render crops
    renderCrops(currentPageCrops);
}

function renderCrops(crops) {
    const tableBody = document.getElementById('crops-table-body');
    tableBody.innerHTML = '';
    
    crops.forEach(crop => {
        // Format dates
        const plantedDate = new Date(crop.plantedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const harvestDate = new Date(crop.harvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${crop.name}</td>
            <td>${crop.field}</td>
            <td>${plantedDate}</td>
            <td>${harvestDate}</td>
            <td><span class="status ${crop.status.toLowerCase()}">${crop.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" data-id="${crop.id}"><i class="fas fa-edit"></i></button>
                    <button class="view-btn" data-id="${crop.id}"><i class="fas fa-eye"></i></button>
                    <button class="delete-btn" data-id="${crop.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function() {
            editCrop(this.dataset.id);
        });
    });
    
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', function() {
            viewCrop(this.dataset.id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            deleteCrop(this.dataset.id);
        });
    });
}

function updatePaginationButtons(currentPage, totalPages) {
    // Enable/disable prev/next buttons
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    
    // Update page buttons
    const pageButtonsContainer = document.querySelector('.pagination-pages');
    pageButtonsContainer.innerHTML = '';
    
    // Determine which page buttons to show
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(startPage + 2, totalPages);
    
    // Adjust if we're near the end
    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        button.textContent = i;
        
        button.addEventListener('click', function() {
            goToPage(i);
        });
        
        pageButtonsContainer.appendChild(button);
    }
}

function nextPage() {
    const currentPage = parseInt(document.querySelector('.page-btn.active').textContent);
    goToPage(currentPage + 1);
}

function prevPage() {
    const currentPage = parseInt(document.querySelector('.page-btn.active').textContent);
    goToPage(currentPage - 1);
}

function goToPage(page) {
    loadCrops(page);
}

function addCrop() {
    // Get form values
    const cropName = document.getElementById('crop-name').value;
    const fieldLocation = document.getElementById('field-location').value;
    const plantingDate = document.getElementById('planting-date').value;
    const harvestDate = document.getElementById('harvest-date').value;
    const status = document.getElementById('crop-status').value;
    const notes = document.getElementById('crop-notes').value;
    
    // Here you would typically send this data to your server
    console.log('Adding crop:', {
        cropName,
        fieldLocation,
        plantingDate,
        harvestDate,
        status,
        notes
    });
    
    // Close modal and reset form
    document.getElementById('add-crop-modal').classList.remove('active');
    document.getElementById('add-crop-form').reset();
    
    // Reload crops to show the new addition
    loadCrops();
    
    // Show success notification
    showNotification('Crop added successfully');
}

function editCrop(id) {
    console.log(`Editing crop with ID: ${id}`);
    // In a real app, you would fetch the crop data and populate a form
    
    // For demo purposes, just show a notification
    showNotification('Editing crop...');
}

function viewCrop(id) {
    console.log(`Viewing crop with ID: ${id}`);
    // In a real app, you would navigate to a detail page or show a modal
    
    // For demo purposes, just show a notification
    showNotification('Viewing crop details...');
}

function deleteCrop(id) {
    console.log(`Deleting crop with ID: ${id}`);
    // In a real app, you would send a delete request to your server
    
    // For demo purposes, just show a notification
    if (confirm('Are you sure you want to delete this crop?')) {
        showNotification('Crop deleted successfully');
        loadCrops();
    }
}

function applyFilters() {
    // Get filter values
    const cropType = document.getElementById('filter-crop').value;
    const field = document.getElementById('filter-field').value;
    const status = document.getElementById('filter-status').value;
    const plantStartDate = document.getElementById('filter-plant-start').value;
    const plantEndDate = document.getElementById('filter-plant-end').value;
    const harvestStartDate = document.getElementById('filter-harvest-start').value;
    const harvestEndDate = document.getElementById('filter-harvest-end').value;
    
    // Here you would typically send these filters to your server
    console.log('Applying filters:', {
        cropType,
        field,
        status,
        plantStartDate,
        plantEndDate,
        harvestStartDate,
        harvestEndDate
    });
    
    // Close modal
    document.getElementById('filter-modal').classList.remove('active');
    
    // Reload crops with filters applied
    loadCrops();
    
    // Show filter indicator
    showFilterIndicator();
}

function resetFilters() {
    // Here you would typically reset server-side filters
    console.log('Resetting filters');
    
    // Close modal
    document.getElementById('filter-modal').classList.remove('active');
    
    // Reload crops without filters
    loadCrops();
    
    // Hide filter indicator
    hideFilterIndicator();
}

function showFilterIndicator() {
    let indicator = document.querySelector('.filter-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'filter-indicator';
        indicator.innerHTML = `
            <span>Filters applied</span>
            <button class="clear-filters-btn">Clear</button>
        `;
        
        const pageHeader = document.querySelector('.page-header');
        pageHeader.appendChild(indicator);
        
        // Add event listener to clear button
        indicator.querySelector('.clear-filters-btn').addEventListener('click', function() {
            resetFilters();
        });
    }
}

function hideFilterIndicator() {
    const indicator = document.querySelector('.filter-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function logout() {
    // Here you would typically clear session/tokens
    window.location.href = 'login.html';
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Append to body
    document.body.appendChild(notification);
    
    // Add some styling
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--primary-color)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '1000';
    notification.style.transition = 'all 0.3s ease';
    
    // Animate in
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}