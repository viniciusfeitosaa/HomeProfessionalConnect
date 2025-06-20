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

### Hybrid Deployment (Frontend + Backend Separation)

The application now supports both monolithic and separated deployment:

**Option 1: Full Replit Deployment**
- **Development**: `npm run dev` starts both frontend and backend in development mode
- **Build**: `npm run build` creates production builds for both client and server
- **Production**: `npm run start` runs the production server
- **Database**: PostgreSQL provisioned through Replit modules
- **Port Configuration**: Server runs on port 5000, exposed as port 80

**Option 2: Netlify Frontend + Replit Backend (Recommended)**
- **Frontend**: Deployed on Netlify with optimized build and CDN
- **Backend**: Remains on Replit for database and API services
- **API Communication**: Frontend connects to Replit backend via CORS-enabled API
- **Configuration**: Environment variables handle API URL switching
- **Benefits**: Better performance, scaling, and cost optimization

### Netlify Frontend Setup
- Independent build system in `/client` directory
- Vite configuration optimized for production
- API requests route to Replit backend via environment variables
- Automatic deployments on Git push
- Custom domain support and SSL included

## Recent Changes

- June 20, 2025 - **NETLIFY FRONTEND MIGRATION**: Configured complete frontend separation for Netlify deployment with independent build system, API configuration, and production-ready setup
- June 19, 2025 - **DATABASE MIGRATION COMPLETE**: Migrated from in-memory storage to PostgreSQL database with full DatabaseStorage implementation, schema creation, and sample data seeding
- June 19, 2025 - Fixed critical security vulnerability CVE-2025-30208 by upgrading Vite from 5.4.14 to 5.4.15
- June 19, 2025 - Resolved user registration routing issue where professionals were incorrectly directed to client interface
- June 18, 2025 - **PRODUCTION-READY LIFEBEE PLATFORM**: Completed all core functionalities with login as main screen, settings, messages, and agenda with full responsive design
- June 18, 2025 - Added LifeBee favicon icon with bee logo design in page header for brand recognition
- June 18, 2025 - Built complete settings area with profile editing, notifications, theme switching, security, and account management
- June 18, 2025 - Constructed full messaging system with conversations list, real-time chat, professional details, and communication tools
- June 18, 2025 - Developed advanced agenda with interactive calendar, appointment details modal, filtering, and scheduling management
- June 18, 2025 - Implemented authentication system allowing both clients and professionals to register and access their respective areas
- June 18, 2025 - Integrated video calls, phone calls, map directions, and appointment management functionality
- June 18, 2025 - **COMPLETE PROVIDER ECOSYSTEM**: Implemented comprehensive dashboard, service mapping, phone verification, and offering system
- June 18, 2025 - Created advanced provider dashboard with monthly earnings analytics, performance metrics, and service statistics
- June 18, 2025 - Added interactive map interface showing nearby service requests with distance filtering and urgency levels
- June 18, 2025 - Implemented complete service offering system allowing providers to bid on client requests with custom pricing
- June 18, 2025 - Built phone verification system with WhatsApp/SMS code validation during provider registration
- June 18, 2025 - Added real-time service opportunities feed with detailed client information and requirements
- June 18, 2025 - Developed comprehensive provider analytics including monthly performance tracking and goal progress
- June 18, 2025 - Created service offer management system with messaging integration and proposal tracking
- June 17, 2025 - **COMPREHENSIVE UX OVERHAUL**: Implemented loading screen, login-first flow, and complete dual-user experience
- June 17, 2025 - Added animated loading screen with LifeBee branding that displays on app startup
- June 17, 2025 - Made login the primary screen that appears after loading, with user type selection
- June 17, 2025 - Created complete provider registration flow with step-by-step onboarding
- June 17, 2025 - Rebuilt agenda system with interactive calendar, time slot selection, and availability checking
- June 17, 2025 - Enhanced professional detail pages with portfolio showcase, reviews, and direct messaging
- June 17, 2025 - Implemented comprehensive messaging system with real-time chat interface
- June 17, 2025 - Added professional portfolio display with service categories and client testimonials
- June 17, 2025 - **MAJOR ARCHITECTURE UPDATE**: Implemented dual-user system with client and provider interfaces
- June 17, 2025 - Created specialized healthcare categories: Fisioterapeuta, Acompanhante Hospitalar, Técnico em Enfermagem
- June 17, 2025 - Added provider dashboard with service management, appointment tracking, and profile configuration
- June 17, 2025 - Updated login system to support user type selection during registration (client vs provider)
- June 17, 2025 - Restructured database schema to support user types and specialized healthcare services
- June 17, 2025 - Implemented subcategory system for specific services (terapias especializadas, acompanhamento hospitalar, curativos e medicação, etc.)
- June 17, 2025 - Enhanced professional data with detailed specializations, certifications, and hourly rates
- June 17, 2025 - Updated appointment system to reflect new service structure with duration and cost tracking
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