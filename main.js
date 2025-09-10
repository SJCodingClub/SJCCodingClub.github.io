import { auth, db, collection, getDocs, query, where, onSnapshot } from './firebase-config.js';
import { loadFarms } from './auth.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) return;
    
    // Load user's farms
    await loadFarms(user.uid);
    
    // Check if a farm is selected
    const selectedFarmId = localStorage.getItem('selectedFarm');
    if (selectedFarmId) {
        await loadFarmDetails(selectedFarmId);
        await loadDashboardData(selectedFarmId);
    } else {
        // Prompt user to select or create a farm
        const farmElements = document.querySelectorAll('#currentFarm');
        farmElements.forEach(element => {
            element.textContent = 'Please select or create a farm in Settings';
        });
    }
}

// Load farm details
async function loadFarmDetails(farmId) {
    try {
        // In a real application, you would fetch the farm details from Firestore
        // For now, we'll just display the farm ID
        const farmElements = document.querySelectorAll('#currentFarm');
        farmElements.forEach(element => {
            element.textContent = `Farm: ${farmId}`;
        });
    } catch (error) {
        console.error('Error loading farm details:', error);
    }
}

// Load dashboard data
async function loadDashboardData(farmId) {
    try {
        // Load fields count
        const fieldsQuery = query(collection(db, 'fields'), where('farmId', '==', farmId));
        const fieldsSnapshot = await getDocs(fieldsQuery);
        document.getElementById('activeFieldsCount').textContent = fieldsSnapshot.size;
        
        // Load livestock count
        const livestockQuery = query(collection(db, 'livestock'), where('farmId', '==', farmId));
        const livestockSnapshot = await getDocs(livestockQuery);
        document.getElementById('totalLivestockCount').textContent = livestockSnapshot.size;
        
        // Load financial data (this would be more complex in a real application)
        document.getElementById('monthlyExpenses').textContent = '$0.00';
        document.getElementById('monthlyRevenue').textContent = '$0.00';
        
        // Load recent activities
        loadRecentActivities(farmId);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load recent activities
async function loadRecentActivities(farmId) {
    try {
        // This would query various collections for recent activities
        // For now, we'll just show a placeholder
        const activitiesList = document.getElementById('activitiesList');
        activitiesList.innerHTML = `
            <div class="activity-item">
                <p>No recent activities</p>
            </div>
        `;
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}