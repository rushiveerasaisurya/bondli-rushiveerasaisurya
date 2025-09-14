# Bondli - Corporate Bond Liquidity Platform

## Overview

Bondli is a regulated digital marketplace designed to increase trading activity and transparency in illiquid corporate bond markets, with a focus on the Indian market. The platform enables matching of buyers and sellers, provides real-time price discovery, and increases participation through fractional ownership of corporate bonds. This is a full-stack web application prototype that demonstrates core functionality including bond trading, portfolio management, market making capabilities, and administrative oversight.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React-based architecture with:
- **React 18** with functional components and hooks for state management
- **Vite** as the build tool and development server for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for server state management, caching, and real-time data synchronization
- **Tailwind CSS** with **shadcn/ui** component library for consistent, modern UI design
- **TypeScript** throughout for type safety and better developer experience

### Backend Architecture
The server follows a RESTful API design with real-time capabilities:
- **Express.js** server with TypeScript for the REST API layer
- **WebSocket Server** using the `ws` library for real-time order book updates and trade notifications
- **Drizzle ORM** for type-safe database operations and schema management
- **PostgreSQL** (via Neon serverless) as the primary database for all application data
- Modular route handlers and storage abstraction layer for clean separation of concerns

### Data Storage Solutions
The application uses a comprehensive PostgreSQL schema designed for financial trading:
- **Users and Authentication**: User profiles, KYC status, account types (retail, institutional, market maker, admin)
- **Financial Accounts**: Cash balances and reserved funds tracking
- **Bond Management**: Complete bond metadata including ISIN, issuer details, ratings, and pricing
- **Trading System**: Orders, trades, and settlement tracking with proper audit trails
- **Portfolio Management**: Holdings, fractional ownership, and P&L calculations
- **Session Management**: PostgreSQL-based session storage for user authentication

### Authentication and Authorization
The system implements a role-based access control system:
- **Session-based Authentication** using PostgreSQL session storage with connect-pg-simple
- **Role-based Access**: Different user types (retail, institutional, market_maker, admin) with appropriate permissions
- **KYC Integration**: Built-in Know Your Customer workflow for regulatory compliance
- User account management with profile information and verification status

### External Dependencies
- **Neon Database**: Serverless PostgreSQL hosting for scalable data storage
- **WebSocket Infrastructure**: Real-time communication for live trading updates
- **Radix UI Primitives**: Accessible, unstyled UI components as the foundation for the design system
- **Replit Integration**: Development environment optimizations including error overlays and cartographer for debugging

The architecture supports the core business requirements of bond trading including order matching, fractional ownership, real-time price discovery, and regulatory compliance while maintaining scalability and type safety throughout the stack.