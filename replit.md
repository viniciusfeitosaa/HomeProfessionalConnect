# Professional Services App

## Overview

This is a full-stack web application that connects people with home service professionals like plumbers, electricians, painters, and HVAC technicians. The app features a mobile-first design with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend:

- **Frontend**: React with TypeScript, built with Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Deployment**: Configured for Replit with autoscaling

## Key Components

### Frontend Architecture
- **Client-side routing**: Using Wouter for lightweight routing
- **Component library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Mobile-first design**: Optimized for mobile devices with responsive layout
- **State management**: TanStack Query for API calls and caching

### Backend Architecture
- **RESTful API**: Express.js with TypeScript
- **Database layer**: Drizzle ORM with PostgreSQL
- **Storage abstraction**: Interface-based storage layer (currently using in-memory storage)
- **API endpoints**: Professional search, user management, appointments, notifications

### Database Schema
The application uses the following main entities:
- **Users**: Authentication and profile management
- **Professionals**: Service provider profiles with ratings and availability
- **Appointments**: Booking system linking users and professionals
- **Notifications**: User notification system

## Data Flow

1. **User Authentication**: Users are identified by ID (currently hardcoded to user ID 1 for demo)
2. **Professional Discovery**: Users can browse professionals by category or search by name/service
3. **Appointment Booking**: Users can schedule appointments with professionals
4. **Notifications**: System tracks unread notifications and displays counts
5. **Real-time Updates**: Using TanStack Query for efficient data fetching and caching

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI components (@radix-ui/react-*, shadcn/ui)
- Utility libraries (clsx, class-variance-authority, date-fns)
- Development tools (Vite, TypeScript)

### Backend Dependencies
- Express.js framework
- Drizzle ORM and PostgreSQL driver (@neondatabase/serverless)
- Database migration tools (drizzle-kit)
- Session management (connect-pg-simple)

### Database
- PostgreSQL 16 (configured via Replit modules)
- Drizzle ORM for type-safe database operations
- Environment-based database URL configuration

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

- **Development**: `npm run dev` starts both frontend and backend in development mode
- **Build**: `npm run build` creates production builds for both client and server
- **Production**: `npm run start` runs the production server
- **Database**: PostgreSQL provisioned through Replit modules
- **Port Configuration**: Server runs on port 5000, exposed as port 80
- **Auto-scaling**: Configured for Replit's autoscale deployment target

The build process:
1. Vite builds the React frontend to `dist/public`
2. esbuild bundles the Express server to `dist/index.js`
3. Production server serves static files and API routes

## Recent Changes

- June 14, 2025 - Removed status bar component from all pages per user request
- June 14, 2025 - Enhanced appointment card with detailed professional information, ratings, distance, and contact options
- June 14, 2025 - Added professional detail page with comprehensive profile, services, reviews, and booking options
- June 14, 2025 - Created agenda, messages, and profile sections with full functionality
- June 14, 2025 - Implemented working navigation between all sections
- June 14, 2025 - Added sample appointment and notification data for realistic testing

## Changelog

- June 14, 2025. Initial setup and full app development

## User Preferences

Preferred communication style: Simple, everyday language.