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
} from "@mui/material";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Added to display registration errors
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", res.user.uid), {
        email: res.user.email,
        role: "VIEWER",
        createdAt: serverTimestamp(),
      });

      navigate("/login");
    } catch (err: any) {
      console.error("Registration failed:", err.code);
      let message = "Registration failed. Try again.";
      if (err.code === "auth/email-already-in-use") {
        message = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      }
      setError(message);
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
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #e3e8f0 100%)",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        {/* Branding Section */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
           <Typography
            variant="h4"
            sx={{ 
              fontWeight: 800, 
              color: "primary.main",
              letterSpacing: -0.5,
              textTransform: 'uppercase'
            }}
          >
            Complyra
          </Typography>
        </Box>

        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, sm: 5 },
            borderRadius: 4,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
            Join the platform to manage enterprise compliance efficiently.
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
                  <EmailOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 2,
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ 
              mb: 1.5,
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
            }}
          />

          {error && (
            <Box sx={{ 
              mb: 2, 
              p: 1.5, 
              borderRadius: 1, 
              bgcolor: "error.lighter", 
              border: "1px solid", 
              borderColor: "error.light" 
            }}>
              <Typography color="error" variant="caption" sx={{ fontWeight: 500 }}>
                {error}
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleRegister}
            disabled={loading}
            sx={{ 
              py: 1.8,
              mt: 2,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 700,
              boxShadow: "0px 8px 16px rgba(25, 118, 210, 0.24)",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0px 10px 20px rgba(25, 118, 210, 0.32)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
          </Button>

          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" color="text.disabled">ACCOUNT CREATION</Typography>
          </Divider>

          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "text.secondary",
            }}>
            Already have an account?{" "}
            <Typography 
              component={RouterLink}
              to="/login"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}>
              Sign In
            </Typography>
          </Typography>
        </Paper>

        <Typography 
          variant="caption" 
          sx={{ 
            mt: 4, 
            display: 'block', 
            textAlign: 'center', 
            color: "text.disabled",
            fontWeight: 500
          }}
        >
          © {new Date().getFullYear()} Complyra Enterprise Solutions. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}