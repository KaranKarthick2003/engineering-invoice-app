const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage (for demo purposes)
let invoices = [];
let clients = [];

// Company settings with default values
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
    logo: null
};

// Routes

// Dashboard
app.get('/api/dashboard', (req, res) => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + (inv.total || 0), 0);
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    
    res.json({
        totalInvoices,
        totalRevenue,
        pendingAmount,
        overdueInvoices
    });
});

// Invoices
app.get('/api/invoices', (req, res) => {
    const { status, search } = req.query;
    let filteredInvoices = invoices;
    
    if (status) {
        filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }
    
    if (search) {
        filteredInvoices = filteredInvoices.filter(inv => 
            inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            inv.clientName.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json(filteredInvoices);
});

app.post('/api/invoices', (req, res) => {
    const invoice = {
        id: uuidv4(),
        invoiceNumber: `INV-${Date.now()}`,
        ...req.body,
        createdAt: moment().toISOString(),
        updatedAt: moment().toISOString()
    };
    
    invoices.push(invoice);
    res.status(201).json(invoice);
});

app.put('/api/invoices/:id', (req, res) => {
    const index = invoices.findIndex(inv => inv.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    
    invoices[index] = {
        ...invoices[index],
        ...req.body,
        updatedAt: moment().toISOString()
    };
    
    res.json(invoices[index]);
});

app.delete('/api/invoices/:id', (req, res) => {
    const index = invoices.findIndex(inv => inv.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Invoice not found' });
    }
    
    invoices.splice(index, 1);
    res.status(204).send();
});

// Clients
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

app.put('/api/clients/:id', (req, res) => {
    const index = clients.findIndex(client => client.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Client not found' });
    }
    
    clients[index] = {
        ...clients[index],
        ...req.body,
        updatedAt: moment().toISOString()
    };
    
    res.json(clients[index]);
});

app.delete('/api/clients/:id', (req, res) => {
    const index = clients.findIndex(client => client.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Client not found' });
    }
    
    clients.splice(index, 1);
    res.status(204).send();
});

// Company settings
app.get('/api/company', (req, res) => {
    res.json(companySettings);
});

app.put('/api/company', (req, res) => {
    companySettings = {
        ...companySettings,
        ...req.body
    };
    res.json(companySettings);
});

// Netlify Functions handler
exports.handler = async (event, context) => {
    return new Promise((resolve, reject) => {
        const req = {
            method: event.httpMethod,
            url: event.path,
            headers: event.headers,
            body: event.body ? JSON.parse(event.body) : {},
            query: event.queryStringParameters || {}
        };

        const res = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            },
            body: '',
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                this.body = JSON.stringify(data);
                resolve(this);
            },
            send: function(data) {
                this.body = data || '';
                resolve(this);
            }
        };

        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS') {
            resolve({
                statusCode: 200,
                headers: res.headers,
                body: ''
            });
            return;
        }

        // Route the request
        try {
            if (req.url.startsWith('/api/dashboard') && req.method === 'GET') {
                const totalInvoices = invoices.length;
                const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
                const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + (inv.total || 0), 0);
                const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
                
                res.json({
                    totalInvoices,
                    totalRevenue,
                    pendingAmount,
                    overdueInvoices
                });
            } else if (req.url.startsWith('/api/company')) {
                if (req.method === 'GET') {
                    res.json(companySettings);
                } else if (req.method === 'PUT') {
                    companySettings = { ...companySettings, ...req.body };
                    res.json(companySettings);
                }
            } else if (req.url.startsWith('/api/clients')) {
                if (req.method === 'GET') {
                    res.json(clients);
                } else if (req.method === 'POST') {
                    const client = {
                        id: uuidv4(),
                        ...req.body,
                        createdAt: moment().toISOString()
                    };
                    clients.push(client);
                    res.status(201).json(client);
                }
            } else if (req.url.startsWith('/api/invoices')) {
                if (req.method === 'GET') {
                    res.json(invoices);
                } else if (req.method === 'POST') {
                    const invoice = {
                        id: uuidv4(),
                        invoiceNumber: `INV-${Date.now()}`,
                        ...req.body,
                        createdAt: moment().toISOString(),
                        updatedAt: moment().toISOString()
                    };
                    invoices.push(invoice);
                    res.status(201).json(invoice);
                }
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
};
