// dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chart
    initYieldChart();
    
    // Initialize modal functionality
    initModals();
    
    // Add event listeners
    document.getElementById('add-crop-btn').addEventListener('click', function() {
        document.getElementById('add-crop-modal').classList.add('active');
    });
    
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // Initialize crop form
    document.getElementById('add-crop-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addCrop();
    });
    
    // Initialize chart period filters
    const chartFilters = document.querySelectorAll('.chart-filters button');
    chartFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            chartFilters.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateChart(this.dataset.period);
        });
    });
});

function initYieldChart() {
    const ctx = document.getElementById('yieldChart').getContext('2d');
    window.yieldChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Wheat',
                data: [12, 14, 15, 14, 16, 17, 18],
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Corn',
                data: [8, 9, 10, 11, 12, 13, 14],
                borderColor: '#ffa000',
                backgroundColor: 'rgba(255, 160, 0, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Tomatoes',
                data: [5, 6, 7, 8, 7, 8, 9],
                borderColor: '#d32f2f',
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Yield (tons)'
                    }
                }
            }
        }
    });
}

function updateChart(period) {
    let labels, wheatData, cornData, tomatoData;
    
    switch(period) {
        case '7':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            wheatData = [12, 14, 15, 14, 16, 17, 18];
            cornData = [8, 9, 10, 11, 12, 13, 14];
            tomatoData = [5, 6, 7, 8, 7, 8, 9];
            break;
        case '30':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            wheatData = [65, 72, 78, 82];
            cornData = [45, 52, 58, 62];
            tomatoData = [30, 35, 40, 45];
            break;
        case '90':
            labels = ['Jun', 'Jul', 'Aug'];
            wheatData = [180, 210, 240];
            cornData = [150, 170, 190];
            tomatoData = [100, 120, 140];
            break;
        case '365':
            labels = ['Q1', 'Q2', 'Q3', 'Q4'];
            wheatData = [450, 520, 580, 620];
            cornData = [350, 390, 420, 450];
            tomatoData = [250, 280, 310, 340];
            break;
    }
    
    window.yieldChart.data.labels = labels;
    window.yieldChart.data.datasets[0].data = wheatData;
    window.yieldChart.data.datasets[1].data = cornData;
    window.yieldChart.data.datasets[2].data = tomatoData;
    window.yieldChart.update();
}

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
    
    // For demo purposes, let's add a fake crop card
    addCropCard(cropName, fieldLocation, plantingDate, harvestDate, status);
    
    // Close modal and reset form
    document.getElementById('add-crop-modal').classList.remove('active');
    document.getElementById('add-crop-form').reset();
    
    // Show success notification
    showNotification('Crop added successfully');
}

function addCropCard(name, location, plantDate, harvestDate, status) {
    const cropCards = document.querySelector('.crop-cards');
    
    // Calculate days between plant and harvest
    const plantDateObj = new Date(plantDate);
    const harvestDateObj = new Date(harvestDate);
    const totalDays = (harvestDateObj - plantDateObj) / (1000 * 60 * 60 * 24);
    
    // Calculate days from plant date to today
    const today = new Date();
    const daysFromPlant = (today - plantDateObj) / (1000 * 60 * 60 * 24);
    
    // Calculate progress percentage
    let progress = Math.round((daysFromPlant / totalDays) * 100);
    progress = Math.max(0, Math.min(progress, 100)); // Ensure between 0-100
    
    // Format dates for display
    const plantDateFormatted = new Date(plantDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const harvestDateFormatted = new Date(harvestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const cropCard = document.createElement('div');
    cropCard.className = 'crop-card';
    cropCard.innerHTML = `
        <div class="crop-header">
            <h3>${name}</h3>
            <div class="crop-location">${location}</div>
            <div class="crop-status ${status.toLowerCase()}">${status}</div>
        </div>
        <div class="crop-details">
            <div class="crop-dates">
                <div class="crop-date">
                    <span>Planted</span>
                    <strong>${plantDateFormatted}</strong>
                </div>
                <div class="crop-date">
                    <span>Harvest</span>
                    <strong>${harvestDateFormatted}</strong>
                </div>
            </div>
            <div class="crop-progress">
                <div class="progress-label">Progress</div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <div class="progress-value">${progress}%</div>
            </div>
        </div>
    `;
    
    cropCards.prepend(cropCard);
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}