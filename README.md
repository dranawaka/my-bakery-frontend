# My Bakery Management System - React Frontend

This is the React frontend for the My Bakery Management System. It provides a modern, responsive user interface for managing bakery operations.

## Features

- **Modern React Architecture**: Built with React 18, hooks, and functional components
- **Responsive Design**: Bootstrap 5 for mobile-first responsive design
- **Authentication**: JWT-based authentication with token refresh
- **State Management**: React Context for global state management
- **Routing**: React Router for client-side navigation
- **Charts**: Chart.js integration for data visualization
- **API Integration**: Axios for HTTP requests to Spring Boot backend

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── cart/           # Shopping cart components
│   ├── customers/      # Customer management
│   ├── dashboard/      # Dashboard and analytics
│   ├── inventory/      # Inventory management
│   ├── layout/         # Layout components (Sidebar, Header)
│   ├── orders/         # Order management
│   ├── products/       # Product management
│   ├── promotions/     # Promotion management
│   ├── reports/        # Reports and analytics
│   ├── users/          # User management
│   └── common/         # Shared/common components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API services
├── styles/             # CSS styles
└── utils/              # Utility functions
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Spring Boot backend running on port 8080

## Installation

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

### Backend Configuration

Ensure your Spring Boot backend is configured to:

1. **Enable CORS** for the React development server
2. **Serve the React build** in production
3. **Handle API requests** on the `/api` endpoint

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Adding New Components

1. Create component file in appropriate directory
2. Import required dependencies
3. Export component
4. Add to routing in `App.js`

### API Integration

Use the `api` service for HTTP requests:

```javascript
import api from '../services/api';

// GET request
const data = await api.get('/endpoint');

// POST request
const response = await api.post('/endpoint', data);

// PUT request
const response = await api.put('/endpoint', data);

// DELETE request
const response = await api.delete('/endpoint');
```

## Deployment

### Development

1. Start Spring Boot backend: `mvn spring-boot:run`
2. Start React frontend: `npm start`
3. Access at: `http://localhost:3000`

### Production

1. Build React app: `npm run build`
2. Copy build files to Spring Boot's `src/main/resources/static`
3. Deploy Spring Boot application

## Backend Integration

The React frontend communicates with the Spring Boot backend through REST APIs. Key endpoints:

- **Authentication**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Orders**: `/api/orders/*`
- **Customers**: `/api/customers/*`
- **Users**: `/api/users/*`
- **Cart**: `/api/cart/*`
- **Dashboard**: `/api/dashboard/*`

## Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Implement proper error handling
4. Add loading states for async operations
5. Use Bootstrap classes for styling
6. Test components thoroughly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS configuration includes React dev server
2. **API Connection**: Verify backend is running on port 8080
3. **Build Errors**: Check for missing dependencies
4. **Routing Issues**: Ensure all routes are properly configured

### Getting Help

- Check browser console for errors
- Verify API endpoints are correct
- Ensure all dependencies are installed
- Check network tab for failed requests

## License

This project is part of the My Bakery Management System. 