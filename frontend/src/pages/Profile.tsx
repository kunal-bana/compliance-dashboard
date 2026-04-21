import {
  Box, Typography, Avatar, Grid, Chip, Stack, Divider, Paper, alpha,
} from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useThemeMode } from "../theme/ThemeContext";
import { useGetProfileQuery } from "../features/users/usersApi";
const roleGradient: Record<string, string> = {
  ADMIN: "linear-gradient(135deg, #ef4444, #dc2626)",
  MANAGER: "linear-gradient(135deg, #f59e0b, #d97706)",
  VIEWER: "linear-gradient(135deg, #6366f1, #3b82f6)",
};
const roleAccent: Record<string, string> = {
  ADMIN: "#ef4444",
  MANAGER: "#f59e0b",
  VIEWER: "#6366f1",
};

export default function Profile() {
  const { data: user, isLoading } = useGetProfileQuery(undefined);
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const email = user?.email;
  const role = user?.role;
  const uid = user?.id;

  const avatarLetter = email ? email[0].toUpperCase() : "U";
  const displayName = email ? email.split("@")[0] : "User";

  const accent = roleAccent[role || "VIEWER"];
  const gradient = roleGradient[role || "VIEWER"];
  if (isLoading) return <div>Loading...</div>;
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} sx={{
          color: "text.primary", letterSpacing: "-0.6px",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          User Profile
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
          Your account details and access permissions.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
        {/* LEFT – Identity Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{
            borderRadius: "18px",
            border: "1px solid", borderColor: "divider",
            boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 20px rgba(0,0,0,0.06)",
            overflow: "hidden", bgcolor: "background.paper",
          }}>
            {/* Gradient banner with pattern */}
            <Box sx={{
              height: 110, background: gradient, position: "relative",
              "&::after": {
                content: '""', position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
              },
            }} />

            <Box sx={{ px: 3, pb: 3.5, textAlign: "center", mt: "-50px" }}>
              <Avatar sx={{
                width: 96, height: 96, fontSize: "2.1rem", fontWeight: 800,
                background: gradient,
                border: `4px solid ${isDark ? "#111827" : "#fff"}`,
                boxShadow: `0 6px 24px ${alpha(accent, 0.45)}`,
                mx: "auto", mb: 2.5,
              }}>
                {avatarLetter}
              </Avatar>

              <Typography variant="h6" fontWeight={800} sx={{
                color: "text.primary", mb: 0.5,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {displayName}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5, fontSize: "0.83rem" }}>
                {email}
              </Typography>

              <Chip label={role} sx={{
                fontWeight: 700, borderRadius: "8px", px: 1,
                background: alpha(accent, isDark ? 0.2 : 0.1),
                color: accent,
                border: `1px solid ${alpha(accent, isDark ? 0.3 : 0.2)}`,
                fontSize: "0.78rem",
              }} />

              <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 0.75, mt: 3,
                p: 1.5, borderRadius: "10px",
                bgcolor: alpha("#10b981", isDark ? 0.1 : 0.06),
                border: `1px solid ${alpha("#10b981", 0.15)}`,
              }}>
                <Box sx={{
                  width: 7, height: 7, borderRadius: "50%", bgcolor: "#10b981",
                  boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
                }} />
                <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600, fontSize: "0.75rem" }}>
                  Active Session
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT – Account Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{
            borderRadius: "18px",
            border: "1px solid", borderColor: "divider",
            boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 20px rgba(0,0,0,0.06)",
            bgcolor: "background.paper",
            p: { xs: 3, md: 4 }, height: "100%",
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 4 }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: "11px",
                bgcolor: alpha("#6366f1", isDark ? 0.18 : 0.1),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#6366f1",
              }}>
                <VerifiedUserIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", fontSize: "1rem" }}>
                Account Information
              </Typography>
            </Stack>

            <Stack spacing={0}>
              <InfoRow icon={<EmailOutlinedIcon fontSize="small" />} label="Email Address" value={email} />
              <Divider sx={{ my: 2.5 }} />
              <InfoRow icon={<FingerprintIcon fontSize="small" />} label="System Identifier (UID)" value={uid} mono />
              <Divider sx={{ my: 2.5 }} />
              <InfoRow icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />} label="Access Level" value={role} accent={accent} />
              <Divider sx={{ my: 2.5 }} />
              <InfoRow icon={<CheckCircleOutlineIcon fontSize="small" />} label="Account Status" value="Active / Verified" isStatus />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function InfoRow({
  icon, label, value, mono, isStatus, accent,
}: {
  icon: React.ReactNode; label: string; value?: string | null;
  mono?: boolean; isStatus?: boolean; accent?: string;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={{ xs: 0.5, sm: 2 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: "text.disabled", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.875rem" }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" fontWeight={600} sx={{
        color: isStatus ? "#10b981" : accent ?? "text.primary",
        fontFamily: mono ? "'JetBrains Mono', 'Courier New', monospace" : "inherit",
        fontSize: mono ? "0.78rem" : "0.875rem",
        wordBreak: "break-all",
        textAlign: { xs: "left", sm: "right" },
        maxWidth: { sm: "60%" },
        letterSpacing: mono ? "0.02em" : "normal",
      }}>
        {value || "—"}
      </Typography>
    </Stack>
  );
}