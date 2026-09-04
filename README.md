# Mini Operations ERP

A small production-oriented full-stack Operations ERP system for managing inventory, work orders, internal stock transfers, and customer stock reservations.

## Project Overview

The Mini Operations ERP follows this business flow:

Inventory → Work Order → Stock Check → Internal Transfer / Shortage → Customer Reservation

The application includes authentication, role-based authorization, inventory management, work order management, internal transfers, and customer order reservations.

## Features

- JWT-based user authentication
- Role-based access control
- Inventory management by item, location, and batch
- Physical, reserved, and available quantity tracking
- Work order creation and status management
- Automatic work order shortage calculation
- Internal inventory transfers
- Transfer workflow: Requested → Dispatched → Received
- Customer order creation and stock reservation
- Prevention of over-reservation
- Prevention of transferring more stock than available
- Backend validation and error handling
- Relational PostgreSQL database

## User Roles

| Role | Permissions |
|---|---|
| Admin | Create items, locations, and work orders; manage authorized operations |
| Operations User | Manage inventory, work orders, and transfers |
| Sales User | Create and manage customer reservations |

Authorization is enforced at the backend using JWT authentication and role-based middleware.

## Tech Stack

### Frontend
- React.js
- Vite
- Axios
- JavaScript

### Backend
- Node.js
- Express.js
- Sequelize ORM
- JWT
- bcrypt
- CORS

### Database
- PostgreSQL

### Testing
- Jest
- Supertest

## Database Design

The system uses the following main entities:

- User
- Item
- Location
- Inventory
- WorkOrder
- Transfer
- CustomerOrder

### Inventory Calculation

Available quantity is calculated as:

```text
Available Quantity = Physical Quantity - Reserved Quantity