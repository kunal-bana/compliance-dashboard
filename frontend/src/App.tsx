import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Typography } from "@mui/material";
import { useAuthInit } from "./hooks/useAuthInit";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const Entities = lazy(() => import("./pages/Entities"));
const Regulations = lazy(() => import("./pages/Regulations"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100%",
      bgcolor: "background.default",
    }}
  >
    {/* Animated Loader */}
    <Box
      sx={{
        position: "relative",
        width: 70,
        height: 70,
        mb: 3,
      }}
    >
      {/* Outer glow ring */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, #6366f1, #3b82f6, #06b6d4, #6366f1)",
          animation: "spin 1.2s linear infinite",
          filter: "blur(6px)",
          opacity: 0.6,
        }}
      />

      {/* Main spinner */}
      <CircularProgress
        size={70}
        thickness={4}
        sx={{
          color: "transparent",
          position: "relative",
          zIndex: 2,
          "& .MuiCircularProgress-circle": {
            stroke: "url(#gradient)",
            strokeLinecap: "round",
          },
        }}
      />

      {/* SVG Gradient */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </Box>

    {/* Text */}
    <Typography
      variant="body1"
      sx={{
        fontWeight: 600,
        color: "text.secondary",
        letterSpacing: "0.08em",
        fontSize: "0.9rem",
        animation: "fade 1.5s ease-in-out infinite",
      }}
    >
      Preparing your workspace...
    </Typography>

    {/* Keyframes */}
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fade {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}
    </style>
  </Box>
);
function App() {
  useAuthInit();
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="entities" element={<Entities />} />
          <Route path="regulations" element={<Regulations />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* ROOT REDIRECT */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;