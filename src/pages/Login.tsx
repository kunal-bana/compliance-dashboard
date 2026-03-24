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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

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
      const res = await signInWithEmailAndPassword(auth, email, password);
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      const from = location.state?.from?.pathname || "/dashboard";
      const role = snapshot.docs[0]?.data()?.role;
      dispatch(setUser({ uid: res.user.uid, email: res.user.email, role }));
      navigate(from, { replace: true });
    } catch (errorVariable: any) {
      const isAuthError = [
        "auth/invalid-credential",
        "auth/user-not-found",
        "auth/wrong-password",
        "auth/invalid-email",
      ].includes(errorVariable.code);
      setError(isAuthError ? "Invalid email or password." : "Login failed. Try again.");
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
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2044 100%)",
        p: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: { xs: "400px", md: "700px" },
          height: { xs: "400px", md: "700px" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-20%",
          left: "-5%",
          width: { xs: "300px", md: "500px" },
          height: { xs: "300px", md: "500px" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        {/* Brand */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              mb: 2,
              boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
            }}
          >
            <ShieldOutlinedIcon sx={{ color: "#fff", fontSize: 26 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.5px",
              fontFamily: "'Georgia', serif",
            }}
          >
            Complyra
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.45)", mt: 0.5, letterSpacing: "0.08em", fontSize: "0.7rem", textTransform: "uppercase" }}>
            Enterprise Compliance Platform
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 5 },
            display: "flex",
            flexDirection: "column",
            borderRadius: "20px",
            bgcolor: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ color: "#fff", mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 4 }}>
            Sign in to access your compliance dashboard.
          </Typography>

          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.35)" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                color: "#fff",
                "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#818cf8" },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" sx={{ color: "rgba(255,255,255,0.35)" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "rgba(255,255,255,0.35)" }}>
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 1.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                color: "#fff",
                "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.4)" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#818cf8" },
            }}
          />

          {error && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: "10px",
                bgcolor: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              <Typography color="error" variant="caption" sx={{ fontWeight: 500 }}>
                {error}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleLogin}
            sx={{
              py: 1.6,
              mt: 2,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
              border: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                boxShadow: "0 12px 28px rgba(99,102,241,0.55)",
                transform: "translateY(-1px)",
              },
              "&:disabled": { opacity: 0.7 },
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In to Dashboard"}
          </Button>

          <Divider sx={{ my: 3.5, "&::before, &::after": { borderColor: "rgba(255,255,255,0.08)" } }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", fontSize: "0.65rem" }}>
              SECURE ACCESS
            </Typography>
          </Divider>

          <Typography variant="body2" sx={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
            Don't have an account?{" "}
            <Typography
              component={RouterLink}
              to="/register"
              sx={{
                color: "#818cf8",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { color: "#a5b4fc", textDecoration: "underline" },
              }}
            >
              Sign Up
            </Typography>
          </Typography>
        </Paper>

        <Typography
          variant="caption"
          sx={{ mt: 4, display: "block", textAlign: "center", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}
        >
          © {new Date().getFullYear()} Complyra Enterprise Solutions. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}