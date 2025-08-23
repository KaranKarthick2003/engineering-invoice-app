// Global variables
let currentInvoiceId = null;
let invoices = [];
let customers = []; // Get all customers
let companySettings = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboard();
    loadCompanySettings();
    
    // Show dashboard by default
    showSection('dashboard');
}

function setupEventListeners() {
    // Navigation event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Invoice form event listener
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', handleInvoiceSubmit);
    }
    
    // Client form event listener
    const clientForm = document.getElementById('client-form');
    if (clientForm) {
        clientForm.addEventListener('submit', handleClientSubmit);
    }
    
    // Company settings form event listener
    const companyForm = document.getElementById('company-form');
    if (companyForm) {
        companyForm.addEventListener('submit', handleCompanySubmit);
    }
    
    // Logo upload event listener
    const logoUpload = document.getElementById('logo-upload');
    if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to corresponding nav link
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Load section-specific data
    if (sectionId === 'invoices') {
        loadInvoices();
    } else if (sectionId === 'clients') {
        loadCustomers();
    } else if (sectionId === 'dashboard') {
        loadDashboard();
    } else if (sectionId === 'create-invoice') {
        resetInvoiceForm();
        loadClientOptions();
        updateInvoiceHeader();
    } else if (sectionId === 'company-settings') {
        loadCompanySettings();
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        const response = await fetch('/api/dashboard');
        const stats = await response.json();
        
        document.getElementById('total-invoices').textContent = stats.totalInvoices;
        document.getElementById('total-revenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
        document.getElementById('pending-amount').textContent = `$${stats.pendingAmount.toFixed(2)}`;
        document.getElementById('overdue-invoices').textContent = stats.overdueInvoices;
        
        // Load recent invoices
        await loadInvoices();
        const recentInvoices = invoices.slice(0, 5);
        displayRecentInvoices(recentInvoices);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadInvoices() {
    // Placeholder for invoice loading
    invoices = [];
}

function resetInvoiceForm() {
    // Placeholder for form reset
}

function displayRecentInvoices(invoices) {
    // Placeholder for recent invoices display
}

function togglePaymentDetails() {
    const paymentMode = document.getElementById('payment-mode').value;
    const bankDetails = document.getElementById('customer-bank-details');
    const displayMode = document.getElementById('display-payment-mode');
    const displayBank = document.getElementById('display-customer-bank');
    
    // Update payment mode display
    const paymentModes = {
        'cash': 'Cash Payment',
        'bank': 'Bank Transfer',
        'cheque': 'Cheque Payment',
        'upi': 'UPI/Digital Payment',
        'card': 'Credit/Debit Card'
    };
    
    displayMode.textContent = paymentModes[paymentMode];
    
    // Show/hide bank details input and display
    if (paymentMode === 'bank') {
        bankDetails.style.display = 'block';
        displayBank.style.display = 'block';
    } else {
        bankDetails.style.display = 'none';
        displayBank.style.display = 'none';
    }
    
    // Update bank details display when input changes
    const bankInfo = document.getElementById('customer-bank-info');
    bankInfo.addEventListener('input', function() {
        const bankDisplay = document.getElementById('display-bank-info');
        bankDisplay.innerHTML = this.value.replace(/\n/g, '<br>');
    });
}

function addInvoiceItem() {
    const container = document.getElementById('invoice-items');
    const itemIndex = container.children.length;
    
    const itemHtml = `
        <div class="invoice-item" data-index="${itemIndex}">
            <div class="item-header">
                <h4><i class="fas fa-box"></i> Item ${itemIndex + 1}</h4>
                <button type="button" class="btn btn-danger btn-sm" onclick="removeInvoiceItem(${itemIndex})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
            <div class="item-content">
                <div class="item-row-primary">
                    <div class="item-field item-field-large">
                        <label><i class="fas fa-tag"></i> Description *</label>
                        <input type="text" name="description" placeholder="Enter item/material description" required>
                    </div>
                    <div class="item-field">
                        <label><i class="fas fa-barcode"></i> HSN/SAC Code</label>
                        <input type="text" name="hsn" placeholder="e.g., 9954">
                    </div>
                </div>
                <div class="item-row-secondary">
                    <div class="item-field">
                        <label><i class="fas fa-calculator"></i> Quantity *</label>
                        <input type="number" name="quantity" value="1" min="0" step="0.01" onchange="calculateItemTotal(${itemIndex})">
                    </div>
                    <div class="item-field">
                        <label><i class="fas fa-ruler"></i> Unit</label>
                        <select name="unit">
                            <option value="Nos">Nos</option>
                            <option value="Sq.Cm">Sq.Cm</option>
                            <option value="Sq.M">Sq.M</option>
                            <option value="Hours">Hours</option>
                            <option value="Days">Days</option>
                            <option value="Kg">Kg</option>
                            <option value="Meters">Meters</option>
                        </select>
                    </div>
                    <div class="item-field">
                        <label><i class="fas fa-rupee-sign"></i> Rate (₹) *</label>
                        <input type="number" name="rate" placeholder="0.00" min="0" step="0.01" onchange="calculateItemTotal(${itemIndex})">
                    </div>
                    <div class="item-field">
                        <label><i class="fas fa-percent"></i> GST (%)</label>
                        <input type="number" name="gst" value="18" min="0" max="100" step="0.01" onchange="calculateItemTotal(${itemIndex})">
                    </div>
                    <div class="item-field">
                        <label><i class="fas fa-money-bill"></i> Total Amount (₹)</label>
                        <input type="number" name="amount" readonly class="readonly-field" placeholder="0.00">
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', itemHtml);
    calculateInvoiceTotal();
}

function removeInvoiceItem(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (item) {
        item.remove();
        calculateInvoiceTotal();
    }
}

function calculateItemTotal(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    const quantity = parseFloat(item.querySelector('[name="quantity"]').value) || 0;
    const rate = parseFloat(item.querySelector('[name="rate"]').value) || 0;
    const gst = parseFloat(item.querySelector('[name="gst"]').value) || 0;
    
    const subtotal = quantity * rate;
    const gstAmount = (subtotal * gst) / 100;
    const total = subtotal + gstAmount;
    
    item.querySelector('[name="amount"]').value = total.toFixed(2);
    calculateInvoiceTotal();
}

function calculateInvoiceTotal() {
    const items = document.querySelectorAll('.invoice-item');
    let subtotal = 0;
    let totalGst = 0;
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('[name="quantity"]').value) || 0;
        const rate = parseFloat(item.querySelector('[name="rate"]').value) || 0;
        const gst = parseFloat(item.querySelector('[name="gst"]').value) || 0;
        
        const itemSubtotal = quantity * rate;
        const itemGst = (itemSubtotal * gst) / 100;
        
        subtotal += itemSubtotal;
        totalGst += itemGst;
    });
    
    const total = subtotal + totalGst;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax-amount').textContent = `₹${totalGst.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${total.toFixed(2)}`;
}

// Customer functions
async function loadCustomers() {
    try {
        const response = await fetch('/api/clients');
        customers = await response.json();
        displayCustomers(customers);
        loadClientOptions();
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function displayCustomers(customers) {
    const container = document.getElementById('clients-list');
    
    if (customers.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No customers found. Add your first customer to get started.</p></div>';
        return;
    }
    
    container.innerHTML = customers.map(customer => `
        <div class="client-card">
            <h3>${customer.name}</h3>
            <p><i class="fas fa-envelope"></i> ${customer.email}</p>
            ${customer.phone ? `<p><i class="fas fa-phone"></i> ${customer.phone}</p>` : ''}
            ${customer.address ? `<p><i class="fas fa-map-marker-alt"></i> ${customer.address}</p>` : ''}
            <p><i class="fas fa-calendar"></i> Added: ${new Date(customer.createdAt).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// ... (rest of the code remains the same)
function loadClientOptions() {
    const select = document.getElementById('client-select');
    select.innerHTML = '<option value="">Select a customer</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

async function handleClientSubmit(e) {
    e.preventDefault();
    
    const clientData = {
        name: document.getElementById('client-name').value,
        email: document.getElementById('client-email').value,
        phone: document.getElementById('client-phone').value,
        address: document.getElementById('client-address').value
    };
    
    try {
        const response = await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });
        
        if (response.ok) {
            closeClientModal();
            await loadCustomers();
        }
    } catch (error) {
        console.error('Error saving client:', error);
    }
}

// Modal functions
function showClientModal() {
    document.getElementById('client-modal').style.display = 'block';
    document.getElementById('client-form').reset();
}

function closeClientModal() {
    document.getElementById('client-modal').style.display = 'none';
}

function closeInvoiceModal() {
    document.getElementById('invoice-modal').style.display = 'none';
}

// Company Settings functions
async function loadCompanySettings() {
    try {
        const response = await fetch('/api/company');
        companySettings = await response.json();
        populateCompanyForm();
    } catch (error) {
        console.error('Error loading company settings:', error);
    }
}

function populateCompanyForm() {
    document.getElementById('company-name').value = companySettings.name || '';
    document.getElementById('company-tagline').value = companySettings.tagline || '';
    document.getElementById('company-address').value = companySettings.address || '';
    document.getElementById('company-phone').value = companySettings.phone || '';
    document.getElementById('company-email').value = companySettings.email || '';
    document.getElementById('company-gstin').value = companySettings.gstin || '';
    document.getElementById('company-state').value = companySettings.state || '';
    document.getElementById('bank-name').value = companySettings.bankName || '';
    document.getElementById('account-number').value = companySettings.accountNo || '';
    document.getElementById('ifsc-code').value = companySettings.ifscCode || '';
    document.getElementById('account-holder').value = companySettings.accountHolder || '';
    
    // Update logo preview
    updateLogoPreview();
}

async function handleCompanySubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('company-name').value,
        tagline: document.getElementById('company-tagline').value,
        address: document.getElementById('company-address').value,
        phone: document.getElementById('company-phone').value,
        email: document.getElementById('company-email').value,
        gstin: document.getElementById('company-gstin').value,
        state: document.getElementById('company-state').value,
        bankName: document.getElementById('bank-name').value,
        accountNo: document.getElementById('account-number').value,
        ifscCode: document.getElementById('ifsc-code').value,
        accountHolder: document.getElementById('account-holder').value,
        logo: companySettings.logo // Keep existing logo
    };
    
    try {
        const response = await fetch('/api/company', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            companySettings = await response.json();
            alert('Company settings saved successfully!');
            updateSidebarTitle();
            updateInvoiceHeader();
        }
    } catch (error) {
        console.error('Error saving company settings:', error);
        alert('Error saving company settings. Please try again.');
    }
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        companySettings.logo = e.target.result;
        updateLogoPreview();
    };
    reader.readAsDataURL(file);
}

function updateLogoPreview() {
    const preview = document.getElementById('logo-preview');
    const removeBtn = document.getElementById('remove-logo');
    
    if (companySettings.logo) {
        preview.innerHTML = `<img src="${companySettings.logo}" alt="Company Logo">`;
        preview.classList.add('has-logo');
        removeBtn.style.display = 'inline-flex';
    } else {
        preview.innerHTML = '<i class="fas fa-image"></i><p>No logo uploaded</p>';
        preview.classList.remove('has-logo');
        removeBtn.style.display = 'none';
    }
}

function removeLogo() {
    companySettings.logo = null;
    document.getElementById('logo-upload').value = '';
    updateLogoPreview();
}

function resetCompanyForm() {
    // Reset form to default values
    document.getElementById('company-form').reset();
    
    // Reset company settings to defaults
    companySettings = {
        name: 'YOUR ENGINEERING COMPANY',
        tagline: 'Professional Engineering Services',
        address: 'Your Company Address',
        phone: 'Your Phone Number',
        email: 'your@email.com',
        gstin: 'Your GSTIN Number',
        state: 'Your State Code',
        bankName: 'Your Bank Name',
        accountNo: 'Your Account Number',
        ifscCode: 'Your IFSC Code',
        accountHolder: 'Your Account Holder Name',
        logo: null
    };
    
    // Repopulate form with defaults
    populateCompanyForm();
    
    // Update UI elements
    updateSidebarTitle();
    updateInvoiceHeader();
}

function updateSidebarTitle() {
    const sidebarTitle = document.querySelector('.sidebar-header h2');
    if (companySettings.name && companySettings.name !== 'YOUR ENGINEERING COMPANY') {
        sidebarTitle.textContent = companySettings.name.split(' ').slice(0, 2).join(' ');
    } else {
        sidebarTitle.textContent = 'Invoice Manager';
    }
}

function updateInvoiceHeader() {
    // Update company info in invoice header
    document.getElementById('header-company-name').textContent = companySettings.name || 'Your Company Name';
    document.getElementById('header-company-tagline').textContent = companySettings.tagline || '';
    document.getElementById('header-company-address').textContent = companySettings.address || '';
    
    const contactInfo = [];
    if (companySettings.phone) contactInfo.push(`Phone: ${companySettings.phone}`);
    if (companySettings.email) contactInfo.push(`Email: ${companySettings.email}`);
    document.getElementById('header-company-contact').textContent = contactInfo.join(' | ');
    
    document.getElementById('header-company-gstin').textContent = companySettings.gstin ? `GSTIN: ${companySettings.gstin}` : '';
    
    // Update logo
    const logoContainer = document.getElementById('invoice-logo-display');
    if (companySettings.logo) {
        logoContainer.innerHTML = `<img src="${companySettings.logo}" alt="Company Logo">`;
        logoContainer.style.border = '1px solid #667eea';
        logoContainer.style.backgroundColor = 'white';
    } else {
        logoContainer.innerHTML = '<i class="fas fa-image" style="color: #a0aec0;"></i>';
        logoContainer.style.border = '1px dashed #cbd5e0';
        logoContainer.style.backgroundColor = '#f7fafc';
    }
    
    // Update preview date and invoice number
    document.getElementById('preview-date').textContent = new Date().toLocaleDateString();
    document.getElementById('preview-invoice-number').textContent = `27${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const clientModal = document.getElementById('client-modal');
    const invoiceModal = document.getElementById('invoice-modal');
    if (event.target === clientModal) {
        closeClientModal();
    }
    if (event.target === invoiceModal) {
        closeInvoiceModal();
    }
}
