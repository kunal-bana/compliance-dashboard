require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

//  DATABASE CONNECTION 
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error(' MongoDB connection error:', error.message);
    // Exit process on database connection failure
    process.exit(1);
  }
};

app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : [
        'http://localhost:5173',
        'https://compliance-dashboard-eta.vercel.app',
      ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

//  SWAGGER API DOCUMENTATION 
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Compliance Dashboard API',
      version: '1.0.0',
      description: 'Production-ready REST API for compliance management with comprehensive error handling and JWT authentication',
      contact: {
        name: 'Support Team',
        email: 'support@compliance-dashboard.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL ||
          (process.env.NODE_ENV === 'production'
            ? 'https://compliance-dashboard-ms5a.onrender.com'
            : 'http://localhost:5000'),
        description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token. Get from /api/auth/login endpoint',
        },
      },

      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            statusCode: { type: 'integer', example: 400 },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },

        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', example: 'user@example.com' },
            role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'VIEWER'] },
            isActive: { type: 'boolean', default: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        Entity: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Company A' },
            type: { type: 'string', example: 'Finance' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Pending', 'Suspended'] },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        Regulation: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'GST Compliance' },
            code: { type: 'string', example: 'GST-01' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Pending', 'Archived'] },
            description: { type: 'string' },
            effectiveDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Submit Report' },
            description: { type: 'string' },
            entityId: { type: 'string' },
            regulationId: { type: 'string' },
            assignedTo: { type: 'string' },
            status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'] },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
            dueDate: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

//  ROUTES 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/entities', require('./routes/entityRoutes'));
app.use('/api/regulations', require('./routes/regulationRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API info endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Compliance Dashboard API',
    version: '1.0.0',
    documentation: '/api-docs',
    healthCheck: '/health',
  });
});

//  404 HANDLER 
app.use((req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
});

//  GLOBAL ERROR HANDLER 
app.use(errorHandler);

//  SERVER STARTUP 
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║    🚀 Compliance Dashboard API Started        ║
╠════════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(36)} ║
║ Port: ${PORT.toString().padEnd(42)} ║
║ Documentation: http://localhost:${PORT}/api-docs  ║
║ Health Check: http://localhost:${PORT}/health    ║
╚════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(' Unhandled Rejection:', err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;