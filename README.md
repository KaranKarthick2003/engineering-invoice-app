# Engineering Invoice Manager

A comprehensive web application for managing invoices for engineering works and projects.

## Features

- **Dashboard**: Overview of invoice statistics and recent activity
- **Invoice Management**: Create, edit, view, and track invoices
- **Client Management**: Maintain client database with contact information
- **Status Tracking**: Track invoice status (Draft, Sent, Paid)
- **Professional Design**: Modern, responsive UI optimized for engineering businesses
- **Invoice Items**: Detailed line items with quantities, rates, and calculations
- **Tax Calculations**: Automatic tax calculations with configurable rates
- **Search & Filter**: Find invoices quickly by client, number, or description

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd C:\Users\dell\CascadeProjects\engineering-invoice-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

4. Open your browser and go to: `http://localhost:3000`

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## Usage

### Creating Your First Invoice

1. **Add a Client**: Go to the Clients section and add your first client
2. **Create Invoice**: Navigate to "New Invoice" and fill in the details
3. **Add Items**: Add engineering services, materials, or hourly work
4. **Review & Save**: Check totals and save as draft
5. **Send Invoice**: Mark as "Sent" when ready to bill the client
6. **Track Payment**: Mark as "Paid" when payment is received

### Invoice Statuses

- **Draft**: Invoice is being prepared
- **Sent**: Invoice has been sent to client
- **Paid**: Payment has been received

## Project Structure

```
engineering-invoice-app/
├── server.js          # Express server and API routes
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html     # Main application interface
│   ├── styles.css     # Application styling
│   └── app.js         # Frontend JavaScript logic
└── README.md          # This file
```

## API Endpoints

- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/dashboard` - Get dashboard statistics

## Customization

### Adding New Fields
To add new fields to invoices or clients, update:
1. The data model in `server.js`
2. The form HTML in `index.html`
3. The form handling in `app.js`

### Styling
Modify `public/styles.css` to customize the appearance.

## Future Enhancements

- PDF invoice generation
- Email integration
- Payment tracking
- Recurring invoices
- Advanced reporting
- Database integration (PostgreSQL/MongoDB)
- User authentication
- Multi-company support

## License

MIT License - feel free to use this for your engineering business!
