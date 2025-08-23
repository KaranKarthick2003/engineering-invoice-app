const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (in production, use a database)
let invoices = [];
let clients = [];
let nextInvoiceNumber = 1;

// Company settings (customizable)
let companySettings = {
    name: 'YOUR ENGINEERING COMPANY',
    tagline: 'Professional Engineering Solutions',
    address: 'Your Company Address\nCity, State - PIN Code',
    phone: 'Your Phone Number',
    email: 'your.email@company.com',
    gstin: 'Your GSTIN Number',
    state: 'Your State Code',
    bankName: 'Your Bank Name',
    accountNo: 'Your Account Number',
    ifscCode: 'Your IFSC Code',
    accountHolder: 'Your Company Name',
    logo: null // Will store base64 encoded logo
};

// Sample data - empty clients list for fresh start

// Routes

// Get all invoices
app.get('/api/invoices', (req, res) => {
    const { status, search } = req.query;
    let filteredInvoices = invoices;
    
    if (status) {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }
    
    if (search) {
        filteredInvoices = filteredInvoices.filter(inv => 
            inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
            inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            inv.description.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json(filteredInvoices);
});

// Get single invoice
app.get('/api/invoices/:id', (req, res) => {
    const invoice = invoices.find(inv => inv.id === req.params.id);
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
});

// Create new invoice
app.post('/api/invoices', (req, res) => {
    const {
        clientId,
        clientName,
        clientEmail,
        clientAddress,
        description,
        items,
        taxRate,
        notes,
        deliveryTerms,
        paymentTerms
    } = req.body;

    // Calculate totals with GST
    let subtotal = 0;
    let totalGst = 0;
    
    const processedItems = items.map(item => {
        const amount = item.quantity * item.rate;
        const gstAmount = amount * (item.gstRate / 100);
        subtotal += amount;
        totalGst += gstAmount;
        
        return {
            ...item,
            amount,
            gstAmount
        };
    });

    const total = subtotal + totalGst;

    const invoice = {
        id: uuidv4(),
        invoiceNumber: `${String(nextInvoiceNumber)}`,
        estimateNumber: `27193`,
        clientId,
        clientName,
        clientEmail,
        clientAddress,
        description,
        items: processedItems,
        subtotal,
        taxRate,
        totalGst,
        total,
        status: 'draft',
        createdAt: moment().toISOString(),
        dueDate: moment().add(30, 'days').toISOString(),
        notes: notes || '',
        deliveryTerms: deliveryTerms || 'Within 20-30 days',
        paymentTerms: paymentTerms || '100% Advance payment',
        additionalTerms: 'Goods once sold can\'t be returned.'
    };

    nextInvoiceNumber++;
    invoices.push(invoice);
    res.status(201).json(invoice);
});

// Update invoice
app.put('/api/invoices/:id', (req, res) => {
    const invoiceIndex = invoices.findIndex(inv => inv.id === req.params.id);
    if (invoiceIndex === -1) {
        return res.status(404).json({ error: 'Invoice not found' });
    }

    const updatedInvoice = { ...invoices[invoiceIndex], ...req.body };
    
    // Recalculate totals if items changed
    if (req.body.items) {
        let subtotal = 0;
        let totalGst = 0;
        
        const processedItems = req.body.items.map(item => {
            const amount = item.quantity * item.rate;
            const gstAmount = amount * (item.gstRate / 100);
            subtotal += amount;
            totalGst += gstAmount;
            
            return {
                ...item,
                amount,
                gstAmount
            };
        });
        
        updatedInvoice.items = processedItems;
        updatedInvoice.subtotal = subtotal;
        updatedInvoice.totalGst = totalGst;
        updatedInvoice.total = subtotal + totalGst;
    }

    invoices[invoiceIndex] = updatedInvoice;
    res.json(updatedInvoice);
});

// Delete invoice
app.delete('/api/invoices/:id', (req, res) => {
    const invoiceIndex = invoices.findIndex(inv => inv.id === req.params.id);
    if (invoiceIndex === -1) {
        return res.status(404).json({ error: 'Invoice not found' });
    }

    invoices.splice(invoiceIndex, 1);
    res.status(204).send();
});

// Client routes
app.get('/api/clients', (req, res) => {
    res.json(clients);
});

app.post('/api/clients', (req, res) => {
    const client = {
        id: uuidv4(),
        ...req.body,
        createdAt: moment().toISOString()
    };
    clients.push(client);
    res.status(201).json(client);
});

// Get company settings
app.get('/api/company', (req, res) => {
    res.json(companySettings);
});

// Update company settings
app.put('/api/company', (req, res) => {
    companySettings = { ...companySettings, ...req.body };
    res.json(companySettings);
});

// Dashboard stats
app.get('/api/dashboard', (req, res) => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0);
    const overdueInvoices = invoices.filter(inv => 
        inv.status === 'sent' && moment().isAfter(moment(inv.dueDate))
    ).length;

    res.json({
        totalInvoices,
        totalRevenue,
        pendingAmount,
        overdueInvoices
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Engineering Invoice App running on http://localhost:${PORT}`);
});
