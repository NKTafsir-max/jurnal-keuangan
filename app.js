// --- 1. CONFIGURATION ---
const CONFIG = {
    SPREADSHEET_ID: '1RtZisB2C4fqlNFbjTsXlJUfr1ekdLeoEFH_89-RHW50', // Ganti dengan ID Spreadsheet Anda
    SHEET_NAME: 'Transactions',
    API_KEY: 'https://script.google.com/macros/s/AKfycbzGWJnqds3WGW5Aop29ywQR9mOQR5aV6KLlN2tFpHrWBcP5qDLOQEtFMfjrt7S7ZHDp/exec' // Ganti setelah deploy Apps Script
};

// --- 2. AUTHENTICATION & SESSION ---
const Auth = {
    checkSession: () => {
        const user = localStorage.getItem('wp_session');
        if (!user && !window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
    },
    login: async (email, password) => {
        if (email && password) {
            localStorage.setItem('wp_session', JSON.stringify({ email, loginTime: new Date() }));
            return true;
        }
        return false;
    },
    logout: () => {
        localStorage.removeItem('wp_session');
        window.location.href = 'login.html';
    }
};

// --- 3. API SERVICE (FETCH TO APPS SCRIPT) ---
const ApiService = {
    async post(data) {
        try {
            const response = await fetch(CONFIG.API_KEY, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return { success: true, message: 'Data sent to Spreadsheet' };
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    async get(action) {
        try {
            const response = await fetch(`${CONFIG.API_KEY}?action=${action}`);
            return await response.json();
        } catch (error) {
            console.error('Fetch Error:', error);
            return [];
        }
    }
};

// --- 4. UI CONTROLLER ---
const UI = {
    showLoading: (btnId) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Saving...`;
        }
    },
    hideLoading: (btnId, originalText) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },
    showToast: (message, type = 'success') => {
        alert(message);
    }
};

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    Auth.checkSession();
    
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = 'save-transaction-btn';
            UI.showLoading(submitBtn);
            
            const formData = {
                date: document.getElementById('date').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value,
                debit: parseFloat(document.getElementById('debit').value) || 0,
                credit: parseFloat(document.getElementById('credit').value) || 0
            };
            
            try {
                await ApiService.post(formData);
                UI.showToast('Transaksi berhasil disimpan!');
                transactionForm.reset();
            } catch (err) {
                UI.showToast('Gagal menyimpan data.', 'error');
            } finally {
                UI.hideLoading(submitBtn, 'Save Transaction');
            }
        });
    }
});
