import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddUserDialog({ open, onClose }: Props) {
  const role = useSelector((state: RootState) => state.auth.role);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] =
    useState<"ADMIN" | "MANAGER" | "VIEWER">("VIEWER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allowedRoles =
    role === "ADMIN"
      ? ["ADMIN", "MANAGER", "VIEWER"]
      : ["VIEWER"];

  const handleAdd = async () => {
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role: userRole,
        status: "Active",
        createdAt: serverTimestamp(),
      });

      onClose();
      setEmail("");
      setPassword("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'info.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'info.main' 
          }}>
            <PersonAddOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Add New User</Typography>
            <Typography variant="caption" color="text.secondary">Provide platform access to a new team member</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none', py: 3 }}>
        <Stack spacing={3}>
          {error && (
             <Box sx={{ 
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

          <TextField
            label="Email Address"
            fullWidth
            placeholder="e.g. employee@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              sx: { borderRadius: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Temporary Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              sx: { borderRadius: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="Assign Permission Level"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as any)}
            InputProps={{ sx: { borderRadius: 2 } }}
          >
            {allowedRoles.map((r) => (
              <MenuItem key={r} value={r}>
                <Typography variant="body2" fontWeight={600}>{r}</Typography>
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
          sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAdd}
          disabled={loading || !email || !password}
          sx={{ 
            borderRadius: 2, 
            px: 4, 
            textTransform: 'none', 
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
          }}
        >
          {loading ? "Creating..." : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}