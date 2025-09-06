# EcoMarket - Sustainable E-commerce Platform

## Overview

EcoMarket is a full-stack e-commerce platform focused on sustainable products with integrated escrow payments, loyalty rewards, and environmental impact tracking. The platform connects conscious consumers with eco-friendly sellers while providing secure transactions and gamified sustainability features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and React Context for local state
- **Styling**: Tailwind CSS with shadcn/ui components for consistent design system
- **Build Tool**: Vite for fast development and optimized production builds
- **Animation**: Framer Motion for smooth UI transitions and interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the full stack
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Basic authentication with localStorage (production would use proper session management)
- **API Design**: RESTful endpoints with consistent error handling and response formatting

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Structure**: 
  - Users with role-based access (buyer, seller, admin)
  - Products with sustainability features and seller relationships
  - Orders with escrow payment states and dispute tracking
  - Loyalty system with points, transactions, and tier management
  - Environmental impact tracking for carbon offset and tree planting
  - Seller KYC and payout management

### Payment & Escrow System
- **Escrow Logic**: Funds held until delivery confirmation or automatic release
- **Payment Processing**: Mock payment service (ready for Stripe/PayPal integration)
- **Dispute Resolution**: Admin intervention system for transaction conflicts
- **Payout Management**: Seller earnings with KYC verification requirements

### Authentication & Authorization
- **User Roles**: Buyer, Seller, and Admin with different access levels
- **Session Management**: Client-side storage with server-side validation
- **Route Protection**: Middleware-based authentication for protected endpoints

### Key Features Implementation
- **Loyalty Program**: Points-based system with tiered rewards (bronze, silver, gold, platinum)
- **Environmental Impact**: Carbon offset tracking and tree planting initiatives
- **Seller Management**: KYC verification, sustainability scoring, and payout controls
- **Admin Tools**: Dispute resolution, order management, and platform oversight

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React routing library

### UI & Styling
- **@radix-ui**: Accessible component primitives for complex UI elements
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **framer-motion**: Animation library for smooth UI interactions

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across frontend and backend
- **@hookform/resolvers**: Form validation with Zod schema integration
- **zod**: Runtime type validation and schema definition

### Payment Integration Ready
- Mock payment services in place for easy integration with:
  - Stripe for payment processing
  - PayPal for alternative payment methods
  - Bank transfer systems for seller payouts

### Monitoring & Analytics Ready
- Structure in place for integrating:
  - Error tracking services
  - Analytics platforms
  - Performance monitoring tools
  - Environmental impact APIs