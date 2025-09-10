import { auth, db, collection, getDocs, query, where } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeReportsPage();
});

function initializeReportsPage() {
    const user = auth.currentUser;
    const farmId = localStorage.getItem('selectedFarm');
    
    if (!user || !farmId) {
        window.location.href = 'settings.html';
        return;
    }
    
    setupEventListeners(farmId);
}

// Set up event listeners
function setupEventListeners(farmId) {
    // Report type change
    document.getElementById('reportType').addEventListener('change', () => {
        // Could adjust form based on report type
    });
    
    // Period change
    document.getElementById('reportPeriod').addEventListener('change', (e) => {
        const customRange = document.getElementById('customDateRange');
        if (e.target.value === 'custom') {
            customRange.style.display = 'block';
        } else {
            customRange.style.display = 'none';
        }
    });
    
    // Generate report button
    document.getElementById('generateReportBtn').addEventListener('click', () => {
        generateReport(farmId);
    });
    
    // Export CSV button
    document.getElementById('exportCsvBtn').addEventListener('click', () => {
        exportToCsv();
    });
}

// Generate report
async function generateReport(farmId) {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    
    try {
        let reportData = [];
        let reportTitle = '';
        
        switch (reportType) {
            case 'financial':
                reportData = await generateFinancialReport(farmId, reportPeriod);
                reportTitle = 'Financial Summary Report';
                break;
            case 'crops':
                reportData = await generateCropsReport(farmId, reportPeriod);
                reportTitle = 'Crop Production Report';
                break;
            case 'livestock':
                reportData = await generateLivestockReport(farmId, reportPeriod);
                reportTitle = 'Livestock Inventory Report';
                break;
            case 'inventory':
                reportData = await generateInventoryReport(farmId, reportPeriod);
                reportTitle = 'Stock Levels Report';
                break;
            case 'all':
                reportData = await generateCompleteReport(farmId, reportPeriod);
                reportTitle = 'Complete Farm Report';
                break;
        }
        
        displayReport(reportData, reportTitle);
        
    } catch (error) {
        console.error('Error generating report:', error);
        document.getElementById('reportResults').innerHTML = '<p>Error generating report. Please try again.</p>';
    }
}

// Generate financial report
async function generateFinancialReport(farmId, period) {
    const q = query(collection(db, 'transactions'), where('farmId', '==', farmId));
    const querySnapshot = await getDocs(q);
    
    let income = 0;
    let expenses = 0;
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
        const transaction = doc.data();
        
        // Apply period filter (simplified - would need date filtering)
        if (transaction.type === 'income') {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
        
        transactions.push({
            date: transaction.date,
            type: transaction.type,
            category: transaction.category,
            description: transaction.description,
            amount: transaction.amount
        });
    });
    
    return {
        summary: {
            totalIncome: income,
            totalExpenses: expenses,
            netProfit: income - expenses
        },
        transactions: transactions
    };
}

// Generate crops report
async function generateCropsReport(farmId, period) {
    const q = query(collection(db, 'fields'), where('farmId', '==', farmId));
    const querySnapshot = await getDocs(q);
    
    const fields = [];
    let totalArea = 0;
    
    querySnapshot.forEach((doc) => {
        const field = doc.data();
        fields.push({
            name: field.name,
            cropType: field.cropType,
            size: field.size,
            status: field.status,
            plantingDate: field.plantingDate,
            harvestDate: field.harvestDate
        });
        
        totalArea += field.size || 0;
    });
    
    return {
        totalFields: fields.length,
        totalArea: totalArea,
        fields: fields
    };
}

// Generate livestock report
async function generateLivestockReport(farmId, period) {
    const q = query(collection(db, 'livestock'), where('farmId', '==', farmId));
    const querySnapshot = await getDocs(q);
    
    const animals = [];
    const countsByType = {};
    const countsByStatus = {};
    
    querySnapshot.forEach((doc) => {
        const animal = doc.data();
        animals.push({
            idTag: animal.idTag,
            type: animal.type,
            breed: animal.breed,
            gender: animal.gender,
            status: animal.status,
            dob: animal.dob
        });
        
        // Count by type
        if (!countsByType[animal.type]) {
            countsByType[animal.type] = 0;
        }
        countsByType[animal.type]++;
        
        // Count by status
        if (!countsByStatus[animal.status]) {
            countsByStatus[animal.status] = 0;
        }
        countsByStatus[animal.status]++;
    });
    
    return {
        totalAnimals: animals.length,
        countsByType: countsByType,
        countsByStatus: countsByStatus,
        animals: animals
    };
}

// Generate inventory report
async function generateInventoryReport(farmId, period) {
    const q = query(collection(db, 'inventory'), where('farmId', '==', farmId));
    const querySnapshot = await getDocs(q);
    
    const items = [];
    let lowStockItems = 0;
    let outOfStockItems = 0;
    
    querySnapshot.forEach((doc) => {
        const item = doc.data();
        items.push({
            name: item.name,
            category: item.categoryName,
            quantity: item.quantity,
            unit: item.unit,
            lowStockThreshold: item.lowStockThreshold
        });
        
        if (item.quantity <= 0) {
            outOfStockItems++;
        } else if (item.quantity <= item.lowStockThreshold) {
            lowStockItems++;
        }
    });
    
    return {
        totalItems: items.length,
        lowStockItems: lowStockItems,
        outOfStockItems: outOfStockItems,
        items: items
    };
}

// Generate complete report
async function generateCompleteReport(farmId, period) {
    const financial = await generateFinancialReport(farmId, period);
    const crops = await generateCropsReport(farmId, period);
    const livestock = await generateLivestockReport(farmId, period);
    const inventory = await generateInventoryReport(farmId, period);
    
    return {
        financial: financial,
        crops: crops,
        livestock: livestock,
        inventory: inventory
    };
}

// Display report
function displayReport(reportData, title) {
    const reportResults = document.getElementById('reportResults');
    
    // Simple display - in a real application, you would create a more detailed report view
    let html = `<h2>${title}</h2>`;
    
    if (reportData.summary) {
        html += `
            <div class="report-summary">
                <h3>Summary</h3>
                <p>Total Income: $${reportData.summary.totalIncome.toFixed(2)}</p>
                <p>Total Expenses: $${reportData.summary.totalExpenses.toFixed(2)}</p>
                <p>Net Profit: $${reportData.summary.netProfit.toFixed(2)}</p>
            </div>
        `;
    }
    
    if (reportData.transactions) {
        html += `
            <div class="report-section">
                <h3>Transactions</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        reportData.transactions.forEach(transaction => {
            html += `
                <tr>
                    <td>${new Date(transaction.date).toLocaleDateString()}</td>
                    <td>${transaction.type}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    reportResults.innerHTML = html;
}

// Export to CSV
function exportToCsv() {
    // This would convert the current report data to CSV format and trigger a download
    alert('CSV export functionality would be implemented here');
}