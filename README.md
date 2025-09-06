
---

# EcoMarket

**Due to corruption in certain sections of the repository by external factors, a zip file has been uploaded for reference.**

EcoMarket is a modern full-stack web application designed to demonstrate scalable architecture, modular design, and seamless integration between frontend and backend systems. The project is structured to support e-commerce or marketplace scenarios, featuring user authentication, product listings, cart management, order processing, loyalty programs, and administrative tools.

---

## Overview

EcoMarket consists of:

* **Client**: A React-based frontend built with TypeScript, Vite, and Tailwind CSS, providing a fast and responsive user interface for browsing products, managing carts, checking out, and accessing dashboards for both users and sellers.
* **Server**: A TypeScript backend that handles API requests, business logic, authentication, order management, and data storage. It exposes RESTful endpoints for the client and includes controllers, services, and route definitions for modularity.
* **Shared**: Common schemas and types used by both client and server to ensure consistency in data validation and communication.
* **Attached Assets**: Additional scripts, configuration files, and assets used for development, testing, or deployment.

---

### Key Features

* **User Authentication**: Secure login and registration flows.
* **Product Listings**: Browse, filter, and view product details.
* **Cart & Checkout**: Add products to cart, view cart, and complete purchases.
* **Order Management**: Track order status, timelines, and disputes.
* **Loyalty Program**: Earn and redeem loyalty points.
* **Seller Dashboard**: Manage payouts, view metrics, and handle orders.
* **Admin Tools**: Administrative controls for managing users, products, and disputes.
* **Notifications**: Real-time updates for order status and other events.

---

### Technologies Used

* **Frontend**: React, TypeScript, Vite, Tailwind CSS
* **Backend**: Node.js, TypeScript
* **Shared**: TypeScript schemas
* **Other**: PostCSS, Drizzle ORM (if configured), utility libraries

---

## Project Structure

```
EcoMarket/
  client/          # Frontend React app (TypeScript, Vite, Tailwind)
  server/          # Backend server (TypeScript)
  shared/          # Shared code (schemas, types)
  attached_assets/ # Additional assets and scripts
```

### Client

* Built with React, TypeScript, Vite, and Tailwind CSS
* Main entry: `client/src/App.tsx`
* Pages: `client/src/pages/`
* Components: `client/src/components/`

### Server

* Built with TypeScript
* Main entry: `server/index.ts`
* Routes: `server/routes.ts`

### Shared

* Contains shared schemas and types for client and server

---

## Folder Roles

* **client/**: Contains the React frontend application including UI components, hooks, pages, and styles.
* **server/**: Contains backend server code, API routes, controllers, services, and configuration.
* **shared/**: Contains TypeScript schemas and types shared between client and server for validation and consistency.
* **attached\_assets/**: Scripts, configuration files, and other assets used for development, deployment, or integration.

---

## Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* npm or yarn

### Installation

```bash
git clone <repo-url>
cd EcoMarket
npm install
```

### Running the Client

```bash
cd client
npm install
npm run dev
```

### Running the Server

```bash
cd server
npm install
npm run dev
```

---

## Scripts

* `npm run dev` - Start development server
* `npm run build` - Build for production

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License.

---


