# LifeBee - Professional Services App

## Overview

LifeBee is a full-stack web application that connects people with healthcare professionals including doctors, nurses, physiotherapists, psychologists, nutritionists, and caregivers. The app features a mobile-first design with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM. The brand identity uses a friendly bee mascot with a construction helmet, featuring warm yellow and orange color scheme.

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

- June 16, 2025 - Applied comprehensive dark mode support across all UI components and pages
- June 16, 2025 - Enhanced user experience with improved visual feedback and transitions
- June 16, 2025 - Optimized professional search and filtering functionality
- June 16, 2025 - Completed theme system integration with consistent light/dark mode styling
- June 16, 2025 - Implemented dark/light theme system with user configuration options in settings page
- June 16, 2025 - Added Stripe payment integration for healthcare services with secure checkout flow
- June 16, 2025 - Enhanced professional images with high-quality healthcare-specific photos (300x300px)
- June 16, 2025 - Created comprehensive settings page with theme selection and app information
- June 16, 2025 - Pivoted application concept from home services to healthcare professionals (doctors, nurses, physiotherapists, psychologists, nutritionists, caregivers)
- June 16, 2025 - Added responsive advertising carousel to home screen with healthcare-focused promotional content
- June 16, 2025 - Enhanced login screen responsiveness across all device sizes with improved breakpoints and spacing
- June 16, 2025 - Updated professional categories and sample data to reflect healthcare specialties
- June 16, 2025 - Implemented new LifeBee logo design with construction helmet reflecting professional services
- June 16, 2025 - Rebranded application to LifeBee with new bee mascot logo throughout the interface
- June 16, 2025 - Updated color scheme to warm yellows and oranges matching the bee brand identity
- June 16, 2025 - Applied LifeBee logo to login screen, sidebar, and mobile header components
- June 16, 2025 - Updated application title and metadata for LifeBee branding
- June 15, 2025 - Implemented comprehensive responsive design across all pages (agenda, messages, profile) with proper breakpoints
- June 15, 2025 - Added back buttons to agenda, messages, and profile pages (hidden on desktop, visible on mobile/tablet)
- June 15, 2025 - Applied consistent responsive layout pattern: sidebar for desktop, bottom navigation for mobile
- June 15, 2025 - Enhanced login screen with full responsive design using proper breakpoints (sm, lg, xl)
- June 15, 2025 - Fixed JSX structure issues and ensured proper component hierarchy across all pages
- June 14, 2025 - Made interface fully responsive for all devices (mobile, tablet, desktop) with grid layouts, breakpoints, and adaptive components
- June 14, 2025 - Added desktop sidebar navigation and optimized mobile bottom navigation
- June 14, 2025 - Restructured appointment card layout with proper button alignment and responsive image sizing
- June 14, 2025 - Created complete login/registration screen with gradient background, logo, form validation, and social login options
- June 14, 2025 - Enhanced interface with more fluid design, improved appointment cards with better spacing and organization
- June 14, 2025 - Reorganized information areas (schedules, ratings, distance) with smaller, properly spaced containers
- June 14, 2025 - Added logout functionality that redirects to login screen
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