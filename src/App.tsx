import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import ProtectedRoute from "./routes/ProtectedRoute";
import {Typography} from "@mui/material";

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
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      width: '100%',
      bgcolor: 'background.default' 
    }}
  >
    <CircularProgress 
      size={50} 
      thickness={4} 
      sx={{ 
        color: '#1976d2',
        mb: 2 
      }} 
    />
    <Typography 
      variant="body1" 
      sx={{ 
        fontWeight: 500, 
        color: 'text.secondary',
        letterSpacing: '0.05em',
        animation: 'pulse 1.5s infinite ease-in-out', 
        '@keyframes pulse': {
          '0%': { opacity: 0.6 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.6 },
        },
      }}
    >
      Preparing your workspace...
    </Typography>
  </Box>
);

function App() {
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