require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
connectDB();

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

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Compliance Dashboard API",
      version: "1.0.0",
      description: "Production-ready API documentation with JWT auth",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://compliance-dashboard-ms5a.onrender.com"
            : "http://localhost:5000",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        AuthInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@test.com" },
            password: { type: "string", example: "123456" },
          },
        },

        Entity: {
          type: "object",
          properties: {
            name: { type: "string", example: "Company A" },
            type: { type: "string", example: "Finance" },
            status: { type: "string", example: "Active" },
          },
        },

        Regulation: {
          type: "object",
          properties: {
            title: { type: "string", example: "GST Compliance" },
            code: { type: "string", example: "GST-01" },
            status: { type: "string", example: "Active" },
          },
        },

        Task: {
          type: "object",
          properties: {
            title: { type: "string", example: "Submit Report" },
            description: { type: "string" },
            status: { type: "string", example: "Pending" },
            priority: { type: "string", example: "High" },
            dueDate: { type: "string", format: "date-time" },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/entities", require("./routes/entityRoutes"));
app.use("/api/regulations", require("./routes/regulationRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => res.send("API running..."));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);