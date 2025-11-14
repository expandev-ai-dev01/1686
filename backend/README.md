# WeatherNow Backend API

Backend API for WeatherNow - Weather information service that provides current temperature, humidity, and daily forecasts.

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Architecture**: REST API

## Project Structure

```
src/
├── api/                    # API route handlers and controllers
├── routes/                 # Route definitions and middleware
│   └── v1/                # Version 1 routes
├── middleware/            # Express middleware
├── services/              # Business logic services
├── utils/                 # Utility functions
├── constants/             # Application constants
├── instances/             # Service instances
├── config/                # Configuration management
└── server.ts              # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`

### Development

Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

### Production

Start production server:
```bash
npm start
```

## API Documentation

### Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.yourdomain.com/api/v1`

### Health Check

```
GET /health
```

Returns API health status.

## Environment Variables

See `.env.example` for all available configuration options.

## Features

- ✅ Express server with TypeScript
- ✅ API versioning support
- ✅ CORS configuration
- ✅ Security middleware (Helmet)
- ✅ Request compression
- ✅ Error handling
- ✅ Health check endpoint
- ✅ Environment-based configuration

## Development Guidelines

- Follow TypeScript strict mode
- Use path aliases (@/) for imports
- Implement proper error handling
- Write comprehensive TSDoc comments
- Follow RESTful API conventions

## License

ISC