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
    console.log('Initializing app...');
    
    try {
        // Set up event listeners
        setupEventListeners();
        
        // Load initial data
        loadDashboard();
        loadCompanySettings();
        
        // Initialize mobile menu functionality
        closeMobileMenuOnNavClick();
        
        // Show dashboard by default
        showSection('dashboard');
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation event listeners
    const navLinks = document.querySelectorAll('.nav-link');
    console.log('Found nav links:', navLinks.length);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            console.log('Navigation clicked:', section);
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
        console.log('Company form found, adding event listener');
        companyForm.addEventListener('submit', handleCompanySubmit);
    } else {
        console.log('Company form NOT found');
    }
    
    // Logo upload event listener
    const logoUpload = document.getElementById('logo-upload');
    if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
    }
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    try {
        // Hide all sections
        const allSections = document.querySelectorAll('.content-section');
        console.log('Found sections:', allSections.length);
        
        allSections.forEach(section => {
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
            console.log('Section activated:', sectionId);
        } else {
            console.error('Section not found:', sectionId);
        }
        
        // Add active class to corresponding nav link
        const navLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (navLink) {
            navLink.classList.add('active');
            console.log('Nav link activated for:', sectionId);
        } else {
            console.error('Nav link not found for:', sectionId);
        }
    } catch (error) {
        console.error('Error in showSection:', error);
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
        loadCompanySettings(); // Ensure company settings are loaded
        updateInvoiceHeader();
    } else if (sectionId === 'company-settings') {
        loadCompanySettings();
    }
    
    // Hide/show company settings buttons based on current section
    hideCompanySettingsButtons(sectionId);
}

// Dashboard functions
function loadDashboard() {
    // Load dashboard with mock data since we don't have backend API
    try {
        document.getElementById('total-invoices').textContent = invoices.length || 0;
        document.getElementById('total-revenue').textContent = `₹${calculateTotalRevenue().toFixed(2)}`;
        document.getElementById('pending-amount').textContent = `₹${calculatePendingAmount().toFixed(2)}`;
        document.getElementById('overdue-invoices').textContent = calculateOverdueInvoices();
        
        // Load recent invoices
        const recentInvoices = invoices.slice(0, 5);
        displayRecentInvoices(recentInvoices);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Set default values if elements don't exist
        const totalInvoicesEl = document.getElementById('total-invoices');
        const totalRevenueEl = document.getElementById('total-revenue');
        const pendingAmountEl = document.getElementById('pending-amount');
        const overdueInvoicesEl = document.getElementById('overdue-invoices');
        
        if (totalInvoicesEl) totalInvoicesEl.textContent = '0';
        if (totalRevenueEl) totalRevenueEl.textContent = '₹0.00';
        if (pendingAmountEl) pendingAmountEl.textContent = '₹0.00';
        if (overdueInvoicesEl) overdueInvoicesEl.textContent = '0';
    }
}

function loadInvoices() {
    // Load invoices from localStorage or use empty array
    const stored = localStorage.getItem('invoices');
    invoices = stored ? JSON.parse(stored) : [];
    return invoices;
}

function calculateTotalRevenue() {
    return invoices.reduce((total, invoice) => total + (invoice.total || 0), 0);
}

function calculatePendingAmount() {
    return invoices.filter(inv => inv.status === 'pending').reduce((total, invoice) => total + (invoice.total || 0), 0);
}

function calculateOverdueInvoices() {
    return invoices.filter(inv => inv.status === 'overdue').length;
}

function loadCustomers() {
    // Load customers from localStorage or use sample data
    const stored = localStorage.getItem('customers');
    customers = stored ? JSON.parse(stored) : [
        {
            id: 1,
            name: "ABC Construction Ltd",
            email: "contact@abcconstruction.com",
            phone: "+91-9876543210",
            address: "123 Industrial Area, Bangalore - 560001"
        }
    ];
    displayCustomers();
}

function displayCustomers() {
    const container = document.getElementById('clients-list');
    if (!container) return;
    
    container.innerHTML = customers.map(customer => `
        <div class="client-card">
            <h3>${customer.name}</h3>
            <p><i class="fas fa-envelope"></i> ${customer.email}</p>
            <p><i class="fas fa-phone"></i> ${customer.phone}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${customer.address}</p>
        </div>
    `).join('');
}

function resetInvoiceForm() {
    const form = document.getElementById('invoice-form');
    if (form) {
        form.reset();
        // Reset items table
        const itemsBody = document.getElementById('invoice-items');
        if (itemsBody) {
            itemsBody.innerHTML = '';
        }
        updateInvoiceHeader();
    }
}

function displayRecentInvoices(invoices) {
    const container = document.getElementById('recent-invoices');
    if (!container) return;
    
    if (invoices.length === 0) {
        container.innerHTML = '<p>No recent invoices found.</p>';
        return;
    }
    
    container.innerHTML = invoices.map(invoice => `
        <div class="invoice-item">
            <div class="invoice-info">
                <h4>Invoice #${invoice.number}</h4>
                <p>${invoice.clientName}</p>
                <span class="invoice-status ${invoice.status}">${invoice.status}</span>
            </div>
            <div class="invoice-amount">₹${invoice.total.toFixed(2)}</div>
        </div>
    `).join('');
}

function loadClientOptions() {
    const select = document.getElementById('client-select');
    if (!select) return;
    
    loadCustomers();
    select.innerHTML = '<option value="">Select Customer</option>' + 
        customers.map(customer => `<option value="${customer.id}">${customer.name}</option>`).join('');
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

// Mobile menu toggle function
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const navMenu = document.querySelector('.nav-menu');
    const toggleButton = document.querySelector('.mobile-menu-toggle i');
    const overlay = document.getElementById('mobile-overlay');
    const body = document.body;
    
    // Toggle classes for both sidebar and nav menu
    sidebar.classList.toggle('mobile-open');
    navMenu.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
    
    // Change icon based on menu state
    if (sidebar.classList.contains('mobile-open')) {
        toggleButton.className = 'fas fa-times';
        body.style.overflow = 'hidden';
    } else {
        toggleButton.className = 'fas fa-bars';
        body.style.overflow = 'auto';
    }
}

// Close mobile menu when a nav link is clicked
function closeMobileMenuOnNavClick() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navMenu = document.querySelector('.nav-menu');
    const toggleButton = document.querySelector('.mobile-menu-toggle i');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('mobile-open');
                if (toggleButton) {
                    toggleButton.className = 'fas fa-bars';
                }
            }
        });
    });
}

// Invoice functions
async function handleInvoiceSubmit(e) {
    e.preventDefault();
    console.log('Invoice form submitted');
    
    // Get form data
    const formData = new FormData(e.target);
    const invoiceData = Object.fromEntries(formData.entries());
    
    try {
        // Save invoice (placeholder for now)
        console.log('Invoice data:', invoiceData);
        alert('Invoice saved successfully!');
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice. Please try again.');
    }
}

function printInvoice() {
    // Check if we're on mobile and use alternative approach
    if (window.innerWidth <= 768) {
        // On mobile, create a new page and use native sharing/printing
        const invoiceHTML = generatePrintableInvoice();
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invoice - Print</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 10px; 
                        padding: 0; 
                        color: #333; 
                        font-size: 14px;
                    }
                    .mobile-actions {
                        position: fixed;
                        top: 10px;
                        right: 10px;
                        z-index: 1000;
                        display: flex;
                        gap: 10px;
                    }
                    .mobile-btn {
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        border-radius: 5px;
                        font-size: 14px;
                        cursor: pointer;
                    }
                    .invoice-container { 
                        max-width: 100%; 
                        margin: 50px 0 0 0; 
                        background: white; 
                    }
                    .invoice-header { 
                        display: block;
                        margin-bottom: 20px; 
                        border-bottom: 2px solid #667eea; 
                        padding-bottom: 15px; 
                    }
                    .company-info h1 { 
                        color: #667eea; 
                        margin: 0 0 10px 0; 
                        font-size: 24px; 
                    }
                    .company-info p { 
                        margin: 3px 0; 
                        color: #666; 
                        font-size: 13px;
                    }
                    .invoice-details { 
                        margin-top: 15px;
                        text-align: right; 
                    }
                    .invoice-details h2 { 
                        color: #667eea; 
                        margin: 0; 
                        font-size: 20px; 
                    }
                    .client-info { 
                        margin: 15px 0; 
                    }
                    .client-info h3 { 
                        color: #333; 
                        margin-bottom: 8px; 
                        font-size: 16px;
                    }
                    .items-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 15px 0; 
                        font-size: 12px;
                    }
                    .items-table th, .items-table td { 
                        border: 1px solid #ddd; 
                        padding: 8px 4px; 
                        text-align: left; 
                    }
                    .items-table th { 
                        background-color: #667eea; 
                        color: white; 
                        font-size: 11px;
                    }
                    .items-table tr:nth-child(even) { 
                        background-color: #f9f9f9; 
                    }
                    .totals-section { 
                        margin-top: 15px; 
                        text-align: right; 
                    }
                    .totals-row { 
                        display: flex; 
                        justify-content: space-between; 
                        margin: 3px 0; 
                        padding: 3px 0; 
                        font-size: 14px;
                    }
                    .total-final { 
                        font-weight: bold; 
                        font-size: 16px; 
                        border-top: 2px solid #667eea; 
                        padding-top: 8px; 
                    }
                    .payment-info { 
                        margin-top: 20px; 
                        padding: 10px; 
                        background-color: #f8f9ff; 
                        border-left: 4px solid #667eea; 
                        font-size: 13px;
                    }
                    .logo { 
                        max-width: 120px; 
                        max-height: 60px; 
                    }
                    @media print {
                        .mobile-actions { display: none; }
                        body { margin: 0; padding: 10px; font-size: 12px; }
                        .invoice-container { margin: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="mobile-actions">
                    <button class="mobile-btn" onclick="window.print()">Print</button>
                    <button class="mobile-btn" onclick="window.close()">Close</button>
                </div>
                ${invoiceHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        return;
    }
    
    // Desktop version
    const printWindow = window.open('', '_blank');
    const invoiceHTML = generatePrintableInvoice();
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - Print</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    color: #333; 
                }
                .invoice-container { 
                    max-width: 800px; 
                    margin: 0 auto; 
                    background: white; 
                }
                .invoice-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: flex-start; 
                    margin-bottom: 30px; 
                    border-bottom: 2px solid #667eea; 
                    padding-bottom: 20px; 
                }
                .company-info h1 { 
                    color: #667eea; 
                    margin: 0; 
                    font-size: 28px; 
                }
                .company-info p { 
                    margin: 5px 0; 
                    color: #666; 
                }
                .invoice-details { 
                    text-align: right; 
                }
                .invoice-details h2 { 
                    color: #667eea; 
                    margin: 0; 
                    font-size: 24px; 
                }
                .client-info { 
                    margin: 20px 0; 
                }
                .client-info h3 { 
                    color: #333; 
                    margin-bottom: 10px; 
                }
                .items-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 20px 0; 
                }
                .items-table th, .items-table td { 
                    border: 1px solid #ddd; 
                    padding: 12px; 
                    text-align: left; 
                }
                .items-table th { 
                    background-color: #667eea; 
                    color: white; 
                }
                .items-table tr:nth-child(even) { 
                    background-color: #f9f9f9; 
                }
                .totals-section { 
                    margin-top: 20px; 
                    text-align: right; 
                }
                .totals-row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin: 5px 0; 
                    padding: 5px 0; 
                }
                .total-final { 
                    font-weight: bold; 
                    font-size: 18px; 
                    border-top: 2px solid #667eea; 
                    padding-top: 10px; 
                }
                .payment-info { 
                    margin-top: 30px; 
                    padding: 15px; 
                    background-color: #f8f9ff; 
                    border-left: 4px solid #667eea; 
                }
                .logo { 
                    max-width: 150px; 
                    max-height: 80px; 
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .invoice-container { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            ${invoiceHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

function generatePrintableInvoice() {
    // Get current form data
    const clientSelect = document.getElementById('client-select');
    const selectedClient = clientSelect.options[clientSelect.selectedIndex]?.text || 'No client selected';
    const description = document.getElementById('invoice-description').value || 'No description';
    const taxRate = document.getElementById('tax-rate').value || '0';
    const paymentMode = document.getElementById('payment-mode').value || 'cash';
    const notes = document.getElementById('invoice-notes').value || '';
    
    // Get payment mode display text
    const paymentModeText = document.getElementById('display-payment-mode').textContent;
    
    // Get customer bank details if visible
    const customerBankDiv = document.getElementById('display-customer-bank');
    const customerBankInfo = customerBankDiv.style.display !== 'none' ? 
        document.getElementById('display-bank-info').innerHTML : '';
    
    // Get totals
    const subtotal = document.getElementById('subtotal').textContent || '₹0.00';
    const taxAmount = document.getElementById('tax-amount').textContent || '₹0.00';
    const totalAmount = document.getElementById('total-amount').textContent || '₹0.00';
    
    // Get company logo
    const logoContainer = document.getElementById('invoice-logo-display');
    const logoHTML = logoContainer.innerHTML.includes('<img') ? 
        logoContainer.innerHTML : '<div style="color: #ccc; font-size: 14px;">No Logo</div>';
    
    // Generate invoice items table
    const itemsContainer = document.getElementById('invoice-items');
    let itemsHTML = '';
    
    if (itemsContainer && itemsContainer.children.length > 0) {
        itemsHTML = `
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>HSN/SAC</th>
                        <th>Qty</th>
                        <th>Sq/M</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        Array.from(itemsContainer.children).forEach(item => {
            const desc = item.querySelector('.item-description')?.value || '';
            const hsn = item.querySelector('.item-hsn')?.value || '';
            const qty = item.querySelector('.item-quantity')?.value || '0';
            const sqm = item.querySelector('.item-sqm')?.value || '0';
            const rate = item.querySelector('.item-rate')?.value || '0';
            const amount = item.querySelector('.item-amount')?.textContent || '₹0.00';
            
            itemsHTML += `
                <tr>
                    <td>${desc}</td>
                    <td>${hsn}</td>
                    <td>${qty}</td>
                    <td>${sqm}</td>
                    <td>₹${rate}</td>
                    <td>${amount}</td>
                </tr>
            `;
        });
        
        itemsHTML += '</tbody></table>';
    } else {
        itemsHTML = '<p style="color: #666; font-style: italic;">No items added to this invoice.</p>';
    }
    
    return `
        <div class="invoice-container">
            <div class="invoice-header">
                <div class="company-info">
                    <div class="logo">${logoHTML}</div>
                    <h1>${companySettings.name || 'Your Company Name'}</h1>
                    <p>${companySettings.tagline || ''}</p>
                    <p>${companySettings.address || 'Your Address'}</p>
                    <p>Phone: ${companySettings.phone || 'Your Phone'}</p>
                    <p>Email: ${companySettings.email || 'your@email.com'}</p>
                    <p>GSTIN: ${companySettings.gstin || 'Your GSTIN'}</p>
                </div>
                <div class="invoice-details">
                    <h2>INVOICE</h2>
                    <p><strong>Invoice #:</strong> INV-${Date.now().toString().slice(-6)}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            
            <div class="client-info">
                <h3>Bill To:</h3>
                <p><strong>${selectedClient}</strong></p>
            </div>
            
            <div class="invoice-content">
                <h3>Project Description:</h3>
                <p>${description}</p>
                
                <h3>Invoice Items:</h3>
                ${itemsHTML}
                
                <div class="totals-section">
                    <div class="totals-row">
                        <span>Subtotal:</span>
                        <span>${subtotal}</span>
                    </div>
                    <div class="totals-row">
                        <span>Tax (${taxRate}%):</span>
                        <span>${taxAmount}</span>
                    </div>
                    <div class="totals-row total-final">
                        <span>Total Amount:</span>
                        <span>${totalAmount}</span>
                    </div>
                </div>
            </div>
            
            <div class="payment-info">
                <h3>Payment Information</h3>
                <p><strong>Payment Mode:</strong> ${paymentModeText}</p>
                ${customerBankInfo ? `<div><strong>Customer Bank Details:</strong><br>${customerBankInfo}</div>` : ''}
                ${companySettings.bankName ? `
                    <div style="margin-top: 15px;">
                        <strong>Our Bank Details:</strong><br>
                        Bank: ${companySettings.bankName}<br>
                        Account: ${companySettings.accountNo}<br>
                        IFSC: ${companySettings.ifscCode}<br>
                        Account Holder: ${companySettings.accountHolder}
                    </div>
                ` : ''}
                ${notes ? `<div style="margin-top: 15px;"><strong>Notes:</strong><br>${notes}</div>` : ''}
            </div>
        </div>
    `;
}

async function handleClientSubmit(e) {
    e.preventDefault();
    console.log('Client form submitted');
    
    // Get form data
    const formData = new FormData(e.target);
    const clientData = Object.fromEntries(formData.entries());
    
    try {
        // Save client (placeholder for now)
        console.log('Client data:', clientData);
        alert('Client saved successfully!');
        closeClientModal();
    } catch (error) {
        console.error('Error saving client:', error);
        alert('Error saving client. Please try again.');
    }
}

// Company Settings functions
async function loadCompanySettings() {
    try {
        // Try to load from localStorage first
        const savedSettings = localStorage.getItem('companySettings');
        if (savedSettings) {
            companySettings = JSON.parse(savedSettings);
        } else {
            // Set default values if no saved settings
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
        }
        populateCompanyForm();
        updateSidebarTitle();
        updateInvoiceHeader();
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
    console.log('Company form submit triggered');
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
    
    console.log('Form data:', formData);
    
    try {
        // Save to localStorage instead of API
        companySettings = formData;
        localStorage.setItem('companySettings', JSON.stringify(companySettings));
        
        console.log('Settings saved to localStorage');
        alert('Company settings saved successfully!');
        updateSidebarTitle();
        updateInvoiceHeader();
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

// Form submission handlers
function handleInvoiceSubmit(e) {
    e.preventDefault();
    alert('Invoice saved successfully!');
    // Add invoice saving logic here
}

function handleClientSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newClient = {
        id: Date.now(),
        name: formData.get('client-name'),
        email: formData.get('client-email'),
        phone: formData.get('client-phone'),
        address: formData.get('client-address')
    };
    
    customers.push(newClient);
    localStorage.setItem('customers', JSON.stringify(customers));
    
    closeClientModal();
    loadClientOptions();
    displayCustomers();
    alert('Customer added successfully!');
}

// Modal functions
function showClientModal() {
    document.getElementById('client-modal').style.display = 'block';
}

function closeClientModal() {
    document.getElementById('client-modal').style.display = 'none';
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    if (modal) modal.style.display = 'none';
}

// Mobile menu functions - Implementation moved to line 480

function closeMobileMenuOnNavClick() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.querySelector('.mobile-menu-toggle i');
            const overlay = document.getElementById('mobile-overlay');
            const body = document.body;
            
            // Close mobile menu when nav link is clicked
            if (sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
                menuToggle.className = 'fas fa-bars';
                body.style.overflow = 'auto';
                console.log('Mobile menu closed via navigation');
            }
        });
    });
}

// Function to hide company settings buttons on non-company-settings sections
function hideCompanySettingsButtons(currentSection) {
    // Find company settings buttons more specifically
    const resetButton = document.querySelector('button[onclick="resetCompanyForm()"]');
    const saveButtons = document.querySelectorAll('button[type="submit"]');
    let companySaveButton = null;
    
    // Find the specific "Save Company Settings" button
    saveButtons.forEach(btn => {
        if (btn.textContent.includes('Save Company Settings')) {
            companySaveButton = btn;
        }
    });
    
    console.log('Hiding/showing company buttons for section:', currentSection);
    
    if (currentSection === 'company-settings') {
        // Show buttons on company settings page
        if (resetButton) {
            resetButton.style.display = 'inline-block';
            console.log('Showing reset button');
        }
        if (companySaveButton) {
            companySaveButton.style.display = 'inline-block';
            console.log('Showing save button');
        }
    } else {
        // Hide buttons on all other pages
        if (resetButton) {
            resetButton.style.display = 'none';
            console.log('Hiding reset button');
        }
        if (companySaveButton) {
            companySaveButton.style.display = 'none';
            console.log('Hiding save button');
        }
    }
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
