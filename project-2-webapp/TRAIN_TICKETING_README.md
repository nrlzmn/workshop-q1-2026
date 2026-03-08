# Train Ticketing Platform - POC

A proof-of-concept web application for a train ticketing platform built with React, Hono, and Cloudflare Workers.

## Overview

This application provides a minimal train ticketing system for searching and booking train trips.

## Features

### Implemented (/)
- **Search Form**: Search for train trips with departure/arrival locations and dates
- **Trip Listings**: Display available train trips with:
  - Departure and arrival times
  - Station locations (Jakarta stations)
  - Trip duration
  - Fare pricing
  - Trip details (Direct, High-speed, etc.)
- **Trip Details Modal**: View detailed information about selected trips
- **Navigation**: Simple routing between pages

### Mock Data
The application uses 6 mock train trips with Jakarta station names:
- Stasiun Gambir
- Stasiun Pasar Senen
- Stasiun Tanah Abang
- Stasiun Manggarai

Each trip includes:
- `tripId`: Unique identifier
- `departureDate`: Departure timestamp
- `fromLocation`: Origin station
- `returnDate`: Arrival timestamp
- `toLocation`: Destination station
- `fare`: Ticket price (USD)
- `ageCategory`: "adult" or "child"

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Backend**: Hono (API framework)
- **Platform**: Cloudflare Workers
- **Build Tool**: Vite
- **Future Database**: Cloudflare D1 (planned)

## Project Structure

```
src/
├── frontend/
│   ├── components/
│   │   ├── Navigation.tsx/css      # Navigation bar
│   │   ├── SearchForm.tsx/css      # Search interface
│   │   ├── TripList.tsx/css        # Trip listings
│   │   └── TripDetail.tsx/css      # Trip detail modal
│   ├── App.tsx                     # Main app component
│   ├── Router.tsx                  # Simple routing logic
│   ├── types.ts                    # TypeScript interfaces
│   └── main.tsx                    # Entry point
└── worker/
    ├── index.ts                    # Hono API routes
```

## API Endpoints

### Worker API Routes
- `GET /api/trips` - Returns all trip data from D1 database
- `POST /api/purchase-ticket` - Triggers workflow to generate PDF invoice and upload to R2

## Development

### Prerequisites
- Node.js (v18+)
- npm/pnpm/yarn

### Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy

# Generate TypeScript types for Cloudflare bindings
npm run cf-typegen
```

## Future Enhancements

1. **Search Functionality**: Add actual filtering based on search criteria
2. **Booking System**: Add passenger selection and payment flow
3. **Authentication**: User accounts and booking history
4. **Real-time Updates**: Train availability and pricing
5. **Mobile Responsive**: Optimize for mobile devices

## Design

The UI is based on a modern train ticketing platform mockup with:
- Clean, minimal interface
- Card-based trip listings
- Modal-based detail views
- Responsive layout
- Professional color scheme (greens, reds, neutrals)

## Notes

- This is a **proof of concept** demonstrating Cloudflare Workers capabilities
- Uses Cloudflare D1 for database, R2 for storage, Browser Rendering for PDF generation, and Workflows for orchestration
- Designed to showcase the full Cloudflare Workers platform stack
