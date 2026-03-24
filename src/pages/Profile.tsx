import {
  Box,
  Typography,
  Avatar,
  Grid,
  Chip,
  Stack,
  Divider,
  Paper,
  alpha,
} from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const roleGradient: Record<string, string> = {
  ADMIN: "linear-gradient(135deg, #ef4444, #dc2626)",
  MANAGER: "linear-gradient(135deg, #f59e0b, #d97706)",
  VIEWER: "linear-gradient(135deg, #3b82f6, #6366f1)",
};

const roleAccent: Record<string, string> = {
  ADMIN: "#ef4444",
  MANAGER: "#f59e0b",
  VIEWER: "#6366f1",
};

export default function Profile() {
  const { email, role, uid } = useSelector((state: RootState) => state.auth);
  const avatarLetter = email?.charAt(0).toUpperCase() ?? "?";
  const displayName = email?.split("@")[0] ?? "User";
  const accent = roleAccent[role ?? "VIEWER"] ?? "#6366f1";
  const gradient = roleGradient[role ?? "VIEWER"] ?? roleGradient.VIEWER;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "black", letterSpacing: "-0.5px" }}>
          User Profile
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Your account details and access permissions.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2.5, md: 4 }}>
        {/* LEFT – Identity Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              overflow: "hidden",
              bgcolor: "background.paper"
            }}
          >
            {/* Gradient Banner */}
            <Box
              sx={{
                height: 100,
                background: gradient,
                position: "relative",
              }}
            />

            {/* Avatar + Info */}
            <Box sx={{ px: 3, pb: 3, textAlign: "center", mt: "-44px" }}>
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  fontSize: "2rem",
                  fontWeight: 800,
                  background: gradient,
                  border: "4px solid #fff",
                  boxShadow: `0 4px 20px ${alpha(accent, 0.4)}`,
                  mx: "auto",
                  mb: 2,
                }}
              >
                {avatarLetter}
              </Avatar>

              <Typography variant="h6" fontWeight={800} sx={{ color: "black", mb: 0.5 }}>
                {displayName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2 }}>
                {email}
              </Typography>

              <Chip
                label={role}
                sx={{
                  fontWeight: 700,
                  borderRadius: "8px",
                  px: 1,
                  background: alpha(accent, 0.12),
                  color: accent,
                  border: `1px solid ${alpha(accent, 0.25)}`,
                  fontSize: "0.8rem",
                }}
              />

              {/* Online indicator */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.75,
                  mt: 2.5,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#10b981",
                    boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
                  }}
                />
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                  Active Session
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT – Account Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              bgcolor: "background.paper",
              p: { xs: 3, md: 4 },
              height: "100%",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  bgcolor: alpha("#6366f1", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6366f1",
                }}
              >
                <VerifiedUserIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: "black" }}>
                Account Information
              </Typography>
            </Stack>

            <Stack spacing={0}>
              <InfoRow
                icon={<EmailOutlinedIcon fontSize="small" />}
                label="Email Address"
                value={email}
              />
              <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.05)" }} />
              <InfoRow
                icon={<FingerprintIcon fontSize="small" />}
                label="System Identifier (UID)"
                value={uid}
                mono
              />
              <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.05)" }} />
              <InfoRow
                icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
                label="Access Level"
                value={role}
                accent={accent}
              />
              <Divider sx={{ my: 2, borderColor: "rgba(0,0,0,0.05)" }} />
              <InfoRow
                icon={<CheckCircleOutlineIcon fontSize="small" />}
                label="Account Status"
                value="Active / Verified"
                isStatus
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono,
  isStatus,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  mono?: boolean;
  isStatus?: boolean;
  accent?: string;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={{ xs: 0.5, sm: 2 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: "#94a3b8", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          color: isStatus ? "#10b981" : accent ?? "#0f172a",
          fontFamily: mono ? "'Courier New', monospace" : "inherit",
          fontSize: mono ? "0.8rem" : "0.875rem",
          wordBreak: "break-all",
          textAlign: { xs: "left", sm: "right" },
          maxWidth: { sm: "60%" },
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}