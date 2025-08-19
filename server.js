const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Add some basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  try {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      port: PORT,
      env: process.env.NODE_ENV || 'development',
      buildPath: path.join(__dirname, 'build'),
      staticPath: path.join(__dirname, 'build/static'),
      processId: process.pid,
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Check if build directory exists
const buildPath = path.join(__dirname, 'build');
const staticPath = path.join(__dirname, 'build/static');

console.log('Checking build directory...');
console.log('Build path:', buildPath);
console.log('Static path:', staticPath);
console.log('Current directory:', __dirname);
console.log('Environment variables:', {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT
});

if (!fs.existsSync(buildPath)) {
  console.error('ERROR: Build directory does not exist!');
  process.exit(1);
}

if (!fs.existsSync(staticPath)) {
  console.error('ERROR: Static directory does not exist!');
  process.exit(1);
}

// Serve static files from the build directory
app.use('/static', express.static(staticPath));

// Serve other static files from the build directory
app.use(express.static(buildPath));

// Handle React routing - return all requests to React app
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  console.log('Serving index.html from:', indexPath);
  
  if (!fs.existsSync(indexPath)) {
    console.error('ERROR: index.html does not exist at:', indexPath);
    res.status(500).send('index.html not found');
    return;
  }
  
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle server startup errors
const server = app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
  console.log(`Build directory: ${buildPath}`);
  console.log(`Static files: ${staticPath}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Server is ready to handle requests');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
