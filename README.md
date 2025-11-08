# Medicine Inventory Management System

A professional, industry-level Angular application for managing medicine inventory with a modern, easy-to-use interface.

## Features

- 🔐 **User Authentication** - Secure login system
- 📊 **Dashboard** - Overview of inventory statistics
- 💊 **Medicine Management** - Add, edit, delete, and view medicines
- 🔍 **Search Functionality** - Search medicines by name, batch, manufacturer, or category
- 📈 **Inventory Tracking** - Monitor stock levels, expiry dates, and low stock alerts
- 🎨 **Modern UI** - Built with Angular Material for a professional look
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

- Angular 17
- Angular Material
- TypeScript
- RxJS
- SCSS

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/
│   │   │   └── login/          # Login component
│   │   ├── dashboard/           # Dashboard component
│   │   ├── medicine/
│   │   │   ├── medicine-list/  # Medicine list with table
│   │   │   ├── medicine-form/   # Add/Edit medicine dialog
│   │   │   └── medicine-search/ # Search component
│   │   ├── inventory/
│   │   │   └── inventory-stats/ # Inventory statistics
│   │   └── shared/
│   │       └── header/          # Navigation header
│   ├── guards/
│   │   └── auth.guard.ts        # Route protection
│   ├── models/
│   │   ├── medicine.model.ts    # Medicine interface
│   │   └── user.model.ts        # User interface
│   ├── services/
│   │   ├── auth.service.ts      # Authentication service
│   │   └── medicine.service.ts  # Medicine CRUD operations
│   ├── app.component.ts
│   ├── app.module.ts
│   └── app-routing.module.ts
├── assets/
├── index.html
├── main.ts
└── styles.scss
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

### Login Credentials

For demo purposes, you can use any username and password to login.

## Key Components

### Dashboard
- Displays total medicines, low stock count, expired count, and total inventory value
- Shows recent medicines
- Quick action buttons

### Medicine List
- Table view of all medicines with sorting and pagination
- Search/filter functionality
- Add, edit, and delete operations

### Medicine Form
- Add new medicines or edit existing ones
- Form validation
- Date pickers for expiry and purchase dates

### Search
- Search medicines by multiple criteria
- Card-based results display

## Development

### Build for production

```bash
npm run build
```

### Run tests

```bash
npm test
```

## Features Overview

### Authentication
- Login page with form validation
- Session management using localStorage
- Route guards to protect authenticated routes

### Medicine Management
- CRUD operations (Create, Read, Update, Delete)
- Status tracking (Available, Low Stock, Out of Stock, Expired)
- Automatic status calculation based on quantity and expiry date

### Data Persistence
- Uses localStorage for demo purposes
- Can be easily replaced with API calls

## Future Enhancements

- Backend API integration
- User roles and permissions
- Advanced reporting and analytics
- Barcode scanning
- Batch operations
- Export functionality (PDF, Excel)
- Notification system
- Audit logs

## License

This project is open source and available for use.

