import { auth, db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, onSnapshot } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeFinancePage();
});

function initializeFinancePage() {
    const user = auth.currentUser;
    const farmId = localStorage.getItem('selectedFarm');
    
    if (!user || !farmId) {
        window.location.href = 'settings.html';
        return;
    }
    
    loadTransactions(farmId);
    setupEventListeners(farmId);
    updateFinanceOverview(farmId);
}

// Load transactions from Firestore
async function loadTransactions(farmId) {
    try {
        const transactionsList = document.getElementById('transactionsList');
        const q = query(collection(db, 'transactions'), where('farmId', '==', farmId));
        
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                transactionsList.innerHTML = '<p>No transactions recorded yet.</p>';
                return;
            }
            
            transactionsList.innerHTML = '';
            snapshot.forEach((doc) => {
                const transaction = doc.data();
                const transactionElement = createTransactionElement(doc.id, transaction);
                transactionsList.appendChild(transactionElement);
            });
        });
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        document.getElementById('transactionsList').innerHTML = '<p>Error loading transactions. Please try again.</p>';
    }
}

// Create HTML element for a transaction
function createTransactionElement(transactionId, transaction) {
    const transactionElement = document.createElement('div');
    transactionElement.className = 'list-item';
    
    const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
    
    transactionElement.innerHTML = `
        <div class="list-item-info">
            <h3>${transaction.description}</h3>
            <p>
                <strong>Category:</strong> ${transaction.category} | 
                <strong>Date:</strong> ${new Date(transaction.date).toLocaleDateString()}
            </p>
            <p><strong>Amount:</strong> <span class="${amountClass}">${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</span></p>
        </div>
        <div class="list-item-actions">
            <button class="btn-secondary edit-transaction" data-id="${transactionId}">Edit</button>
            <button class="btn-secondary delete-transaction" data-id="${transactionId}">Delete</button>
        </div>
    `;
    
    // Add event listeners
    transactionElement.querySelector('.edit-transaction').addEventListener('click', () => editTransaction(transactionId));
    transactionElement.querySelector('.delete-transaction').addEventListener('click', () => deleteTransaction(transactionId));
    
    return transactionElement;
}

// Update finance overview
async function updateFinanceOverview(farmId) {
    try {
        const q = query(collection(db, 'transactions'), where('farmId', '==', farmId));
        const querySnapshot = await getDocs(q);
        
        let totalRevenue = 0;
        let totalExpenses = 0;
        
        querySnapshot.forEach((doc) => {
            const transaction = doc.data();
            if (transaction.type === 'income') {
                totalRevenue += transaction.amount;
            } else {
                totalExpenses += transaction.amount;
            }
        });
        
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('netProfit').textContent = `$${(totalRevenue - totalExpenses).toFixed(2)}`;
        
    } catch (error) {
        console.error('Error updating finance overview:', error);
    }
}

// Set up event listeners
function setupEventListeners(farmId) {
    // Add income button
    document.getElementById('addIncomeBtn').addEventListener('click', () => {
        openTransactionModal('income');
    });
    
    // Add expense button
    document.getElementById('addExpenseBtn').addEventListener('click', () => {
        openTransactionModal('expense');
    });
    
    // Transaction form submission
    document.getElementById('transactionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveTransaction(farmId);
    });
    
    // Cancel button
    document.getElementById('cancelTransactionBtn').addEventListener('click', () => {
        closeTransactionModal();
    });
    
    // Modal close button
    document.querySelector('#transactionModal .close').addEventListener('click', () => {
        closeTransactionModal();
    });
    
    // Filter transactions
    document.getElementById('transactionTypeFilter').addEventListener('change', () => {
        filterTransactions();
    });
    
    document.getElementById('transactionCategoryFilter').addEventListener('change', () => {
        filterTransactions();
    });
    
    document.getElementById('transactionMonthFilter').addEventListener('change', () => {
        filterTransactions();
    });
    
    document.getElementById('transactionSearch').addEventListener('input', () => {
        filterTransactions();
    });
}

// Open transaction modal
function openTransactionModal(transactionId = null, type = 'income') {
    const modal = document.getElementById('transactionModal');
    const title = document.getElementById('transactionModalTitle');
    
    if (transactionId) {
        title.textContent = 'Edit Transaction';
        document.getElementById('transactionId').value = transactionId;
        // Load transaction data would go here
    } else {
        title.textContent = type === 'income' ? 'Add Income' : 'Add Expense';
        document.getElementById('transactionId').value = '';
        document.getElementById('transactionType').value = type;
        document.getElementById('transactionForm').reset();
    }
    
    modal.style.display = 'block';
}

// Close transaction modal
function closeTransactionModal() {
    document.getElementById('transactionModal').style.display = 'none';
}

// Save transaction to Firestore
async function saveTransaction(farmId) {
    const transactionId = document.getElementById('transactionId').value;
    const transactionData = {
        type: document.getElementById('transactionType').value,
        category: document.getElementById('transactionCategory').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        date: document.getElementById('transactionDate').value,
        description: document.getElementById('transactionDescription').value,
        farmId: farmId,
        updatedAt: new Date()
    };
    
    try {
        if (transactionId) {
            // Update existing transaction
            await updateDoc(doc(db, 'transactions', transactionId), transactionData);
        } else {
            // Add new transaction
            transactionData.createdAt = new Date();
            await addDoc(collection(db, 'transactions'), transactionData);
        }
        
        closeTransactionModal();
        updateFinanceOverview(farmId);
    } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Error saving transaction. Please try again.');
    }
}

// Edit transaction
function editTransaction(transactionId) {
    openTransactionModal(transactionId);
}

// Delete transaction
async function deleteTransaction(transactionId) {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'transactions', transactionId));
        // Update finance overview after deletion
        const farmId = localStorage.getItem('selectedFarm');
        updateFinanceOverview(farmId);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
    }
}

// Filter transactions
function filterTransactions() {
    const typeFilter = document.getElementById('transactionTypeFilter').value;
    const categoryFilter = document.getElementById('transactionCategoryFilter').value;
    const monthFilter = document.getElementById('transactionMonthFilter').value;
    const searchTerm = document.getElementById('transactionSearch').value.toLowerCase();
    
    const transactionItems = document.querySelectorAll('.list-item');
    
    transactionItems.forEach(item => {
        const transactionType = item.querySelector('.list-item-info p').textContent.toLowerCase();
        const transactionDescription = item.querySelector('.list-item-info h3').textContent.toLowerCase();
        
        const typeMatch = typeFilter === 'all' || transactionType.includes(typeFilter);
        const categoryMatch = categoryFilter === 'all' || transactionType.includes(categoryFilter);
        const searchMatch = transactionDescription.includes(searchTerm);
        
        // Month filter would require more complex logic based on the date
        
        if (typeMatch && categoryMatch && searchMatch) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}