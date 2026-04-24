import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Alert,
  Fade,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");

    if (!email && !password) {
      setError("Please fill all fields");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.message) {
          throw new Error(data.message);
        }
        throw new Error("Registration failed");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleRegister();
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      color: "#fff",
      fontSize: "0.95rem",
      background: "rgba(255,255,255,0.04)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "& fieldset": {
        borderColor: "rgba(255,255,255,0.12)",
        transition: "border-color 0.2s ease",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255,255,255,0.25)",
      },
      "&.Mui-focused": {
        background: "rgba(255,255,255,0.06)",
        "& fieldset": {
          borderColor: "#818cf8",
          borderWidth: "1.5px",
          boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
        },
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.40)",
      fontSize: "0.9rem",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#a5b4fc",
    },
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0a0f1e 0%, #111827 45%, #0c1a3a 100%)",
      p: 2,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
      "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)
        `,
        pointerEvents: "none",
      },
    }}>
      {/* Animated gradient orbs */}
      <Box sx={{
        position: "absolute",
        top: "-20%",
        left: "-8%",
        width: { xs: 300, md: 580 },
        height: { xs: 300, md: 580 },
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
        filter: "blur(50px)",
        animation: "float 10s ease-in-out infinite",
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-30px, 30px)" },
        },
      }} />
      <Box sx={{
        position: "absolute",
        bottom: "-15%",
        right: "-5%",
        width: { xs: 250, md: 480 },
        height: { xs: 250, md: 480 },
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        filter: "blur(50px)",
        animation: "float 12s ease-in-out infinite reverse",
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(30px, -30px)" },
        },
      }} />

      {/* Grid overlay */}
      <Box sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.02,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        {/* Brand mark */}
        <Box sx={{
          mb: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          animation: "slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "@keyframes slideDown": {
            from: { opacity: 0, transform: "translateY(-20px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}>
          <Box sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "14px",
            background: "linear-gradient(135deg, #6366f1, #3b82f6)",
            boxShadow: "0 12px 32px rgba(99,102,241,0.35)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)",
              animation: "shimmer 3s infinite",
              "@keyframes shimmer": {
                "0%": { transform: "translateX(-100%)" },
                "100%": { transform: "translateX(100%)" },
              },
            },
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="white"
                fillOpacity="0.95"
              />
            </svg>
          </Box>

          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.8px",
                fontSize: "1.5rem",
              }}
            >
              Complyra
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.40)",
                letterSpacing: "0.15em",
                fontSize: "0.60rem",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Enterprise Compliance
            </Typography>
          </Box>
        </Box>

        {/* Premium Glass Card */}
        <Fade in={true} timeout={1000}>
          <Paper elevation={0} sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: "28px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.025) 100%)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.3),
              inset 0 1px 1px rgba(255,255,255,0.15),
              0 0 1px rgba(255,255,255,0.05)
            `,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: `
                0 12px 48px rgba(0,0,0,0.35),
                inset 0 1px 1px rgba(255,255,255,0.15),
                0 0 2px rgba(99,102,241,0.15)
              `,
              background: "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.030) 100%)",
            },
          }}>
            <Typography variant="h5" fontWeight={800} sx={{
              color: "#fff",
              mb: 0.5,
              letterSpacing: "-0.5px",
              fontSize: "1.5rem",
            }}>
              Create Account
            </Typography>
            <Typography sx={{
              color: "rgba(255,255,255,0.45)",
              mb: 4,
              fontSize: "0.9rem",
              fontWeight: 500,
            }}>
              Join the platform to manage enterprise compliance efficiently
            </Typography>

            {/* Success Alert */}
            {success && (
              <Alert
                severity="success"
                sx={{
                  mb: 2.5,
                  borderRadius: "12px",
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  color: "#86efac",
                  "& .MuiAlert-icon": { color: "#10b981" },
                  animation: "slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "@keyframes slideIn": {
                    from: { opacity: 0, transform: "translateY(-10px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                Account created successfully! Redirecting to login...
              </Alert>
            )}

            {/* Email Input */}
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.25)" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5, ...fieldSx }}
            />

            {/* Password Input */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || success}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.25)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        color: "rgba(255,255,255,0.25)",
                        transition: "color 0.2s ease",
                        "&:hover": { color: "rgba(255,255,255,0.45)" },
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2.5, ...fieldSx }}
            />

            {/* Password Requirements */}
            {password && (
              <Box sx={{
                mb: 2.5,
                p: 1.5,
                borderRadius: "10px",
                background: "rgba(99,102,241,0.05)",
                border: "1px solid rgba(99,102,241,0.15)",
              }}>
                <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.60)", mb: 1 }}>
                  Password Requirements:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor: password.length >= 6 ? "#10b981" : "rgba(255,255,255,0.15)",
                    }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.60)" }}>
                      At least 6 characters {password.length >= 6 && "✓"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: "12px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#fca5a5",
                  "& .MuiAlert-icon": { color: "#ef4444" },
                  animation: "slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "@keyframes slideIn": {
                    from: { opacity: 0, transform: "translateY(-10px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Create Account Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleRegister}
              disabled={loading || success}
              sx={{
                py: 1.75,
                mt: 1,
                borderRadius: "14px",
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "0.02em",
                background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)",
                boxShadow: "0 8px 28px rgba(99,102,241,0.40), inset 0 1px 0 rgba(255,255,255,0.2)",
                border: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.15), transparent)",
                  transform: "translateX(-100%)",
                  animation: loading ? "none" : "shine 3s infinite",
                  "@keyframes shine": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                  },
                },
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                  boxShadow: "0 12px 40px rgba(99,102,241,0.50), inset 0 1px 0 rgba(255,255,255,0.2)",
                  transform: "translateY(-2px)",
                },
                "&:active": { transform: "translateY(0)" },
                "&:disabled": { opacity: 0.7, cursor: "not-allowed" },
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : success ? (
                <>
                  <CheckCircleOutlineIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
                  Created Successfully!
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <Divider sx={{
              my: 4,
              "&::before, &::after": { borderColor: "rgba(255,255,255,0.08)" },
            }}>
              <Typography sx={{
                color: "rgba(255,255,255,0.22)",
                letterSpacing: "0.12em",
                fontSize: "0.60rem",
                fontWeight: 600,
                textTransform: "uppercase",
              }}>
                Account Creation
              </Typography>
            </Divider>

            <Typography variant="body2" sx={{
              textAlign: "center",
              color: "rgba(255,255,255,0.40)",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}>
              Already have an account?{" "}
              <Typography component={RouterLink} to="/login" sx={{
                color: "#a5b4fc",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#c7d2fe",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                },
              }}>
                Sign In
              </Typography>
            </Typography>
          </Paper>
        </Fade>

        {/* Footer */}
        <Typography variant="caption" sx={{
          mt: 5,
          display: "block",
          textAlign: "center",
          color: "rgba(255,255,255,0.15)",
          fontWeight: 500,
          fontSize: "0.75rem",
          letterSpacing: "0.05em",
          animation: "fadeIn 1.2s ease",
          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}>
          © {new Date().getFullYear()} Complyra Enterprise Solutions. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}