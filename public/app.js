// Global variables
let currentInvoiceId = null;
let invoices = [];
let customers = []; // Get all customers
let companySettings = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting app initialization...');
    initializeApp();
});

// Fallback initialization in case DOMContentLoaded doesn't fire
window.addEventListener('load', function() {
    console.log('Window Load event fired...');
    if (!document.querySelector('.content-section.active')) {
        console.log('No active section found, initializing app...');
        initializeApp();
    }
});

function initializeApp() {
    console.log('Initializing app...');
    
    try {
        // Set up event listeners
        setupEventListeners();
        
        // Load initial data
        loadDashboard();
        loadCompanySettings();
        loadCustomers();
        
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
    
    if (navLinks.length === 0) {
        console.error('No navigation links found!');
        return;
    }
    
    navLinks.forEach((link, index) => {
        console.log(`Setting up nav link ${index}:`, link.getAttribute('data-section'));
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
    
    // Tax rate change listener
    const taxRateInput = document.getElementById('tax-rate');
    if (taxRateInput) {
        taxRateInput.addEventListener('input', calculateInvoiceTotals);
    }
    
    // Payment mode change listener
    const paymentModeSelect = document.getElementById('payment-mode');
    if (paymentModeSelect) {
        paymentModeSelect.addEventListener('change', togglePaymentDetails);
    }
    
    // Bank details change listeners
    const bankInputs = ['customer-bank-name', 'customer-account-number', 'customer-ifsc-code', 'customer-account-holder'];
    bankInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updateBankDisplay);
        }
    });
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
            
            // Load section-specific data
            switch(sectionId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'invoices':
                    loadInvoices();
                    break;
                case 'clients':
                    displayCustomers();
                    break;
                case 'create-invoice':
                    initializeInvoiceForm();
                    break;
                case 'company-settings':
                    loadCompanySettings();
                    break;
            }
            
            // Hide company settings buttons on non-company-settings sections
            hideCompanySettingsButtons(sectionId);
        } else {
            console.error('Section not found:', sectionId);
        }
        
        // Add active class to corresponding nav link
        const activeNavLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }
        
    } catch (error) {
        console.error('Error showing section:', error);
    }
}

// Load data from localStorage
function loadData() {
    try {
        const savedInvoices = localStorage.getItem('invoices');
        const savedCustomers = localStorage.getItem('customers');
        const savedCompanySettings = localStorage.getItem('companySettings');
        
        invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
        customers = savedCustomers ? JSON.parse(savedCustomers) : [];
        companySettings = savedCompanySettings ? JSON.parse(savedCompanySettings) : {};
        
        console.log('Data loaded:', { invoices: invoices.length, customers: customers.length });
    } catch (error) {
        console.error('Error loading data:', error);
        invoices = [];
        customers = [];
        companySettings = {};
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('invoices', JSON.stringify(invoices));
        localStorage.setItem('customers', JSON.stringify(customers));
        localStorage.setItem('companySettings', JSON.stringify(companySettings));
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Dashboard functions
function loadDashboard() {
    loadData();
    updateDashboardStats();
    loadRecentInvoices();
}

function updateDashboardStats() {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const pendingAmount = invoices
        .filter(invoice => invoice.status !== 'paid')
        .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const overdueInvoices = invoices.filter(invoice => {
        if (invoice.status === 'paid') return false;
        const dueDate = new Date(invoice.dueDate);
        return dueDate < new Date();
    }).length;
    
    document.getElementById('total-invoices').textContent = totalInvoices;
    document.getElementById('total-revenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('pending-amount').textContent = `₹${pendingAmount.toFixed(2)}`;
    document.getElementById('overdue-invoices').textContent = overdueInvoices;
}

function loadRecentInvoices() {
    const recentInvoices = invoices.slice(-5).reverse();
    const container = document.getElementById('recent-invoices-list');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (recentInvoices.length === 0) {
        container.innerHTML = '<p class="no-data">No invoices yet</p>';
        return;
    }
    
    recentInvoices.forEach(invoice => {
        const invoiceCard = createInvoiceCard(invoice);
        container.appendChild(invoiceCard);
    });
}

// Customer functions
function loadCustomers() {
    loadData();
    loadClientOptions();
    displayCustomers();
}

function loadClientOptions() {
    const select = document.getElementById('client-select');
    if (!select) return;
    
    select.innerHTML = '<option value="">Choose a customer...</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

function displayCustomers() {
    const container = document.getElementById('clients-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (customers.length === 0) {
        container.innerHTML = '<p class="no-data">No customers yet. Add your first customer!</p>';
        return;
    }
    
    customers.forEach(customer => {
        const customerCard = document.createElement('div');
        customerCard.className = 'customer-card';
        customerCard.innerHTML = `
            <div class="customer-info">
                <h3>${customer.name}</h3>
                <p><i class="fas fa-envelope"></i> ${customer.email}</p>
                ${customer.phone ? `<p><i class="fas fa-phone"></i> ${customer.phone}</p>` : ''}
                ${customer.address ? `<p><i class="fas fa-map-marker-alt"></i> ${customer.address}</p>` : ''}
            </div>
            <div class="customer-actions">
                <button class="btn btn-secondary" onclick="editCustomer('${customer.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteCustomer('${customer.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(customerCard);
    });
}

function handleClientSubmit(e) {
    e.preventDefault();
    
    console.log('Form submitted, collecting data...');
    
    const formData = new FormData(e.target);
    const clientData = {
        id: Date.now().toString(),
        name: formData.get('client-name'),
        email: formData.get('client-email'),
        phone: formData.get('client-phone'),
        address: formData.get('client-address')
    };
    
    console.log('Collected client data:', clientData);
    
    // Validate required fields
    if (!clientData.name || clientData.name.trim() === '') {
        alert('Please enter a company name');
        return;
    }
    
    if (!clientData.email || clientData.email.trim() === '') {
        alert('Please enter an email address');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    console.log('Validation passed, adding customer...');
    
    // Add to customers array
    customers.push(clientData);
    
    // Save to localStorage
    saveData();
    
    // Close modal and refresh display
    closeClientModal();
    loadClientOptions();
    displayCustomers();
    
    // Show success message
    alert('Customer added successfully!');
    console.log('Customer added successfully:', clientData);
}

// Invoice functions
function loadInvoices() {
    loadData();
    displayInvoices();
}

function displayInvoices() {
    const container = document.getElementById('invoices-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (invoices.length === 0) {
        container.innerHTML = '<p class="no-data">No invoices yet. Create your first invoice!</p>';
        return;
    }
    
    invoices.forEach(invoice => {
        const invoiceCard = createInvoiceCard(invoice);
        container.appendChild(invoiceCard);
    });
}

function createInvoiceCard(invoice) {
    const card = document.createElement('div');
    card.className = 'invoice-card';
    
    const statusClass = invoice.status || 'draft';
    const statusText = statusClass.charAt(0).toUpperCase() + statusClass.slice(1);
    
    card.innerHTML = `
        <div class="invoice-header">
            <h3>Invoice #${invoice.invoiceNumber}</h3>
            <span class="status ${statusClass}">${statusText}</span>
        </div>
        <div class="invoice-details">
            <p><strong>Client:</strong> ${invoice.clientName || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ₹${(invoice.total || 0).toFixed(2)}</p>
        </div>
        <div class="invoice-actions">
            <button class="btn btn-secondary" onclick="viewInvoice('${invoice.id}')">
                <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-primary" onclick="editInvoice('${invoice.id}')">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-danger" onclick="deleteInvoice('${invoice.id}')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    return card;
}

function editCustomer(customerId) {
    // Implementation for editing customer
    console.log('Edit customer:', customerId);
    alert('Edit customer functionality coming soon!');
}

function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        customers = customers.filter(customer => customer.id !== customerId);
        saveData();
        displayCustomers();
        loadClientOptions();
        alert('Customer deleted successfully!');
    }
}

function viewInvoice(invoiceId) {
    // Implementation for viewing invoice
    console.log('View invoice:', invoiceId);
    alert('View invoice functionality coming soon!');
}

function editInvoice(invoiceId) {
    // Implementation for editing invoice
    console.log('Edit invoice:', invoiceId);
    alert('Edit invoice functionality coming soon!');
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        invoices = invoices.filter(invoice => invoice.id !== invoiceId);
        saveData();
        displayInvoices();
        loadDashboard();
        alert('Invoice deleted successfully!');
    }
}

// Modal functions
function showClientModal() {
    const modal = document.getElementById('client-modal');
    if (modal) {
        modal.style.display = 'block';
        // Reset form
        const form = document.getElementById('client-form');
        if (form) {
            form.reset();
        }
    }
}

function closeClientModal() {
    const modal = document.getElementById('client-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    if (modal) {
        modal.style.display = 'none';
    }
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
function initializeInvoiceForm() {
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

function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    try {
        // Get basic invoice data
        const clientId = document.getElementById('client-select').value;
        const description = document.getElementById('invoice-description').value;
        const taxRate = document.getElementById('tax-rate').value;
        const paymentMode = document.getElementById('payment-mode').value;
        const notes = document.getElementById('invoice-notes').value;
        
        // Get bank details if payment mode is bank transfer
        let bankDetails = null;
        if (paymentMode === 'bank') {
            bankDetails = {
                bankName: document.getElementById('customer-bank-name').value,
                accountNumber: document.getElementById('customer-account-number').value,
                ifscCode: document.getElementById('customer-ifsc-code').value,
                accountHolder: document.getElementById('customer-account-holder').value
            };
        }
        
        // Get items from the invoice
        const itemsContainer = document.getElementById('invoice-items');
        const itemRows = itemsContainer.querySelectorAll('.invoice-item');
        const items = [];
        
        itemRows.forEach(row => {
            const description = row.querySelector('.item-description').value;
            const quantity = parseFloat(row.querySelector('.item-quantity').value);
            const rate = parseFloat(row.querySelector('.item-rate').value);
            const amount = parseFloat(row.querySelector('.item-amount').textContent.replace('₹', ''));
            
            items.push({ description, quantity, rate, amount });
        });
        
        // Calculate totals
        const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('₹', ''));
        const taxAmount = parseFloat(document.getElementById('tax-amount').textContent.replace('₹', ''));
        const total = parseFloat(document.getElementById('total-amount').textContent.replace('₹', ''));
        
        // Create invoice object
        const invoice = {
            id: Date.now(),
            number: document.getElementById('preview-invoice-number').textContent,
            date: new Date().toISOString(),
            clientId,
            description,
            taxRate,
            paymentMode,
            bankDetails,
            notes,
            items,
            subtotal,
            taxAmount,
            total,
            status: 'draft'
        };
        
        // Save to localStorage
        invoices.push(invoice);
        saveData();
        
        alert('Invoice saved successfully!');
        showSection('invoices');
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
        </div>
    `;
}

// Invoice Item Functions
function addInvoiceItem() {
    const itemsContainer = document.getElementById('invoice-items');
    if (!itemsContainer) return;
    
    const itemId = Date.now().toString();
    const itemRow = document.createElement('div');
    itemRow.className = 'invoice-item';
    itemRow.id = `item-${itemId}`;
    
    itemRow.innerHTML = `
        <div class="item-content">
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="item-description" placeholder="Item description" required>
            </div>
            <div class="form-group">
                <label>HSN/SAC</label>
                <input type="text" class="item-hsn" placeholder="HSN/SAC code">
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="item-quantity" value="1" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Sq/M</label>
                <input type="number" class="item-sqm" value="0" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Rate (₹)</label>
                <input type="number" class="item-rate" value="0" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Amount (₹)</label>
                <span class="item-amount">₹0.00</span>
            </div>
            <div class="form-group">
                <button type="button" class="remove-item" onclick="removeInvoiceItem('${itemId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    itemsContainer.appendChild(itemRow);
    
    // Add event listeners for calculation
    const quantityInput = itemRow.querySelector('.item-quantity');
    const sqmInput = itemRow.querySelector('.item-sqm');
    const rateInput = itemRow.querySelector('.item-rate');
    
    [quantityInput, sqmInput, rateInput].forEach(input => {
        input.addEventListener('input', () => calculateItemAmount(itemId));
    });
    
    // Calculate initial amount
    calculateItemAmount(itemId);
    calculateInvoiceTotals();
}

function removeInvoiceItem(itemId) {
    const itemRow = document.getElementById(`item-${itemId}`);
    if (itemRow) {
        itemRow.remove();
        calculateInvoiceTotals();
    }
}

function calculateItemAmount(itemId) {
    const itemRow = document.getElementById(`item-${itemId}`);
    if (!itemRow) return;
    
    const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
    const sqm = parseFloat(itemRow.querySelector('.item-sqm').value) || 0;
    const rate = parseFloat(itemRow.querySelector('.item-rate').value) || 0;
    
    // Calculate amount based on quantity and rate, or sqm and rate
    let amount = 0;
    if (sqm > 0) {
        amount = sqm * rate;
    } else {
        amount = quantity * rate;
    }
    
    itemRow.querySelector('.item-amount').textContent = `₹${amount.toFixed(2)}`;
}

function calculateInvoiceTotals() {
    const itemsContainer = document.getElementById('invoice-items');
    if (!itemsContainer) return;
    
    let subtotal = 0;
    const itemRows = itemsContainer.querySelectorAll('.invoice-item');
    
    itemRows.forEach(itemRow => {
        const amountText = itemRow.querySelector('.item-amount').textContent;
        const amount = parseFloat(amountText.replace('₹', '')) || 0;
        subtotal += amount;
    });
    
    const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    // Update totals display
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('tax-amount').textContent = `₹${taxAmount.toFixed(2)}`;
    document.getElementById('total-amount').textContent = `₹${total.toFixed(2)}`;
}

function resetInvoiceForm() {
    const form = document.getElementById('invoice-form');
    if (form) {
        form.reset();
    }
    
    const itemsContainer = document.getElementById('invoice-items');
    if (itemsContainer) {
        itemsContainer.innerHTML = '';
    }
    
    // Reset totals
    document.getElementById('subtotal').textContent = '₹0.00';
    document.getElementById('tax-amount').textContent = '₹0.00';
    document.getElementById('total-amount').textContent = '₹0.00';
    
    // Reset payment mode display
    document.getElementById('display-payment-mode').textContent = 'Cash Payment';
    document.getElementById('display-customer-bank').style.display = 'none';
    
    // Update invoice header
    updateInvoiceHeader();
}

function updateInvoiceHeader() {
    // Update invoice number
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    document.getElementById('preview-invoice-number').textContent = invoiceNumber;
    
    // Update date
    document.getElementById('preview-date').textContent = new Date().toLocaleDateString();
    
    // Update company information
    if (companySettings.name) {
        document.getElementById('header-company-name').textContent = companySettings.name;
    }
    if (companySettings.tagline) {
        document.getElementById('header-company-tagline').textContent = companySettings.tagline;
    }
    if (companySettings.address) {
        document.getElementById('header-company-address').textContent = companySettings.address;
    }
    if (companySettings.phone || companySettings.email) {
        const contact = [];
        if (companySettings.phone) contact.push(companySettings.phone);
        if (companySettings.email) contact.push(companySettings.email);
        document.getElementById('header-company-contact').textContent = contact.join(' | ');
    }
    if (companySettings.gstin) {
        document.getElementById('header-company-gstin').textContent = `GSTIN: ${companySettings.gstin}`;
    }
}

function togglePaymentDetails() {
    const paymentMode = document.getElementById('payment-mode').value;
    const bankDetailsSection = document.getElementById('customer-bank-details');
    const displayPaymentMode = document.getElementById('display-payment-mode');
    const displayCustomerBank = document.getElementById('display-customer-bank');
    
    if (paymentMode === 'bank') {
        bankDetailsSection.style.display = 'block';
        displayPaymentMode.textContent = 'Bank Transfer';
        displayCustomerBank.style.display = 'block';
        updateBankDisplay();
    } else {
        bankDetailsSection.style.display = 'none';
        displayPaymentMode.textContent = paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1) + ' Payment';
        displayCustomerBank.style.display = 'none';
    }
}

function updateBankDisplay() {
    const bankName = document.getElementById('customer-bank-name').value;
    const accountNumber = document.getElementById('customer-account-number').value;
    const ifscCode = document.getElementById('customer-ifsc-code').value;
    const accountHolder = document.getElementById('customer-account-holder').value;
    
    const displayBankInfo = document.getElementById('display-bank-info');
    if (displayBankInfo) {
        displayBankInfo.innerHTML = `
            <p>Bank: ${bankName || 'N/A'}</p>
            <p>Account: ${accountNumber || 'N/A'}</p>
            <p>IFSC: ${ifscCode || 'N/A'}</p>
            <p>Holder: ${accountHolder || 'N/A'}</p>
        `;
    }
}
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
    
    try {
        // Get basic invoice data
        const clientId = document.getElementById('client-select').value;
        const description = document.getElementById('invoice-description').value;
        const taxRate = document.getElementById('tax-rate').value;
        const paymentMode = document.getElementById('payment-mode').value;
        const notes = document.getElementById('invoice-notes').value;
        
        // Get bank details if payment mode is bank transfer
        let bankDetails = null;
        if (paymentMode === 'bank') {
            bankDetails = {
                bankName: document.getElementById('customer-bank-name').value,
                accountNumber: document.getElementById('customer-account-number').value,
                ifscCode: document.getElementById('customer-ifsc-code').value,
                accountHolder: document.getElementById('customer-account-holder').value
            };
        }
        
        // Get items from the invoice
        const itemsContainer = document.getElementById('invoice-items');
        const itemRows = itemsContainer.querySelectorAll('.invoice-item');
        const items = [];
        
        itemRows.forEach(row => {
            const description = row.querySelector('.item-description').value;
            const quantity = parseFloat(row.querySelector('.item-quantity').value);
            const rate = parseFloat(row.querySelector('.item-rate').value);
            const amount = parseFloat(row.querySelector('.item-amount').textContent.replace('₹', ''));
            
            items.push({ description, quantity, rate, amount });
        });
        
        // Calculate totals
        const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('₹', ''));
        const taxAmount = parseFloat(document.getElementById('tax-amount').textContent.replace('₹', ''));
        const total = parseFloat(document.getElementById('total-amount').textContent.replace('₹', ''));
        
        // Create invoice object
        const invoice = {
            id: Date.now(),
            number: document.getElementById('preview-invoice-number').textContent,
            date: new Date().toISOString(),
            clientId,
            description,
            taxRate,
            paymentMode,
            bankDetails,
            notes,
            items,
            subtotal,
            taxAmount,
            total,
            status: 'draft'
        };
        
        // Save to localStorage
        invoices.push(invoice);
        saveData();
        
        alert('Invoice saved successfully!');
        showSection('invoices');
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice. Please try again.');
    }
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

// Debug function to test navigation
window.testNavigation = function(section) {
    console.log('Testing navigation to:', section);
    showSection(section);
}

