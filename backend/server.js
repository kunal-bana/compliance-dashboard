require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://compliance-dashboard-eta.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Swagger Config
const swaggerOptions = {
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Compliance Dashboard API",
      version: "1.0.0",
      description: "API documentation for Compliance Dashboard Backend",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://compliance-dashboard-ms5a.onrender.com"
            : "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/*.js"], // routes folder
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/entities", require("./routes/entityRoutes"));
app.use("/api/regulations", require("./routes/regulationRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Health Check Route (important for deployment)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error Handler (always last)
app.use(errorHandler);

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);