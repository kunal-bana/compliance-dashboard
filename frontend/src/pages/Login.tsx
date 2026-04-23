import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.data.token);

      dispatch(setUser({
        uid: data.data.user._id,
        email: data.data.user.email,
        role: data.data.user.role,
      }));

      navigate("/dashboard");

    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0a0f1e 0%, #111827 45%, #0c1a3a 100%)",
        p: 2,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Ambient blobs */}
      <Box sx={{
        position: "absolute", top: "-20%", right: "-5%",
        width: { xs: 300, md: 600 }, height: { xs: 300, md: 600 },
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)",
        pointerEvents: "none", filter: "blur(40px)",
      }} />
      <Box sx={{
        position: "absolute", bottom: "-15%", left: "-8%",
        width: { xs: 250, md: 500 }, height: { xs: 250, md: 500 },
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)",
        pointerEvents: "none", filter: "blur(40px)",
      }} />
      {/* Grid overlay */}
      <Box sx={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        {/* Brand mark */}
        <Box
          sx={{
            mb: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #3b82f6)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.45)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </Box>

          {/* Text */}
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.8px",
              }}
            >
              Complyra
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.14em",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Enterprise Compliance Platform
            </Typography>
          </Box>
        </Box>

        <Paper elevation={0} sx={{
          p: { xs: 3.5, sm: 4.5 },
          display: "flex", flexDirection: "column",
          borderRadius: "24px",
          bgcolor: "rgba(255,255,255,0.035)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}>
          <Typography variant="h5" fontWeight={800} sx={{ color: "#fff", mb: 0.5, letterSpacing: "-0.5px" }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.42)", mb: 4, fontSize: "0.875rem" }}>
            Sign in to access your compliance dashboard.
          </Typography>

          <TextField
            fullWidth label="Email Address" variant="outlined"
            autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.28)" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px", color: "#fff", fontSize: "0.9rem",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.22)" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: "1.5px" },
                bgcolor: "rgba(255,255,255,0.03)",
              },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#818cf8" },
            }}
          />

          <TextField
            fullWidth label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined" autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.28)" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "rgba(255,255,255,0.28)" }}>
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "14px", color: "#fff", fontSize: "0.9rem",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.22)" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: "1.5px" },
                bgcolor: "rgba(255,255,255,0.03)",
              },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#818cf8" },
            }}
          />

          {error && (
            <Box sx={{
              mb: 2, p: 1.5, borderRadius: "12px",
              bgcolor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              display: "flex", alignItems: "center", gap: 1,
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#ef4444", flexShrink: 0 }} />
              <Typography color="error" variant="caption" sx={{ fontWeight: 500, color: "#fca5a5" }}>
                {error}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth variant="contained" size="large"
            disabled={loading} onClick={handleLogin}
            sx={{
              py: 1.65, mt: 2.5, borderRadius: "14px",
              textTransform: "none", fontSize: "0.925rem", fontWeight: 700,
              letterSpacing: "0.01em",
              background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
              boxShadow: "0 8px 28px rgba(99,102,241,0.45)",
              border: "none", transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                boxShadow: "0 12px 36px rgba(99,102,241,0.6)",
                transform: "translateY(-1px)",
              },
              "&:active": { transform: "translateY(0)" },
              "&:disabled": { opacity: 0.65 },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Sign In to Dashboard"}
          </Button>

          <Divider sx={{
            my: 3.5,
            "&::before, &::after": { borderColor: "rgba(255,255,255,0.06)" },
          }}>
            <Typography sx={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", fontSize: "0.62rem", fontWeight: 600, textTransform: "uppercase" }}>
              Secure Access
            </Typography>
          </Divider>

          <Typography variant="body2" sx={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.83rem" }}>
            Don't have an account?{" "}
            <Typography component={RouterLink} to="/register" sx={{
              color: "#818cf8", fontWeight: 700, textDecoration: "none",
              "&:hover": { color: "#a5b4fc" },
            }}>
              Sign Up
            </Typography>
          </Typography>
        </Paper>

        <Typography variant="caption" sx={{
          mt: 4, display: "block", textAlign: "center",
          color: "rgba(255,255,255,0.15)", fontWeight: 500,
        }}>
          © {new Date().getFullYear()} Complyra Enterprise Solutions. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}