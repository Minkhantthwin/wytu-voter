require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://wytu-voter.online']
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Swagger UI (disable in production if needed)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Wytu Voting API Docs',
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// Serve static files (candidate photos)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
const candidatesRoute = require('./src/routes/candidates');
const voteRoute = require('./src/routes/vote');
const resultsRoute = require('./src/routes/results');
const checkRoute = require('./src/routes/check');
const uploadRoute = require('./src/routes/upload');
const adminRoute = require('./src/routes/admin');
const settingsRoute = require('./src/routes/settings');

app.use('/api/candidates', candidatesRoute);
app.use('/api/vote', voteRoute);
app.use('/api/results', resultsRoute);
app.use('/api/check', checkRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/admin', adminRoute);
app.use('/api/settings', settingsRoute);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, 'client/dist')));

  // Handle React routing - return index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
