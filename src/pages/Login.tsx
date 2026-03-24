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
  Divider
} from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setUser } from "../features/auth/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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

    const q = query(
      collection(db, "users"),
      where("email", "==", email)
    );
    const snapshot = await getDocs(q);
    const from = location.state?.from?.pathname || "/dashboard";
    const role = snapshot.docs[0]?.data()?.role;

    dispatch(
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        role,
      })
    );

    navigate(from, { replace: true });
  } catch (errorVariable: any) { // We define it here
    console.error("Login error code:", errorVariable.code);

    const isAuthError = [
      "auth/invalid-credential",
      "auth/user-not-found",
      "auth/wrong-password",
      "auth/invalid-email"
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
        background: "radial-gradient(circle at 50% 50%, #ffffff 0%, #e3e8f0 100%)",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        {/* Logo/Brand Section Above Paper */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
           <Typography
            variant="h4"
            sx={{ 
              fontWeight: 800, 
              color: "primary.main",
              letterSpacing: -0.5,
              textTransform: 'uppercase'
            }}>
            Complyra
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
            Please enter your details to access the management system.
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
              mb: 2.5,
              "& .MuiOutlinedInput-root": { borderRadius: 2 }
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
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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
            disabled={loading}
            onClick={handleLogin}
            sx={{
              py: 1.8,
              mt: 2,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 700,
              boxShadow: "0px 8px 16px rgba(25, 118, 210, 0.24)",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0px 10px 20px rgba(25, 118, 210, 0.32)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In to Dashboard"}
          </Button>

          <Divider sx={{ my: 4 }}>
            <Typography variant="caption" color="text.disabled">SECURE ACCESS</Typography>
          </Divider>

          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            Don’t have an account?{" "}
            <Typography 
              component={RouterLink}
              to="/register"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign Up
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
          }}>
          © {new Date().getFullYear()} Complyra Enterprise Solutions. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}