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
  Skeleton,
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

  if (isLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: "18px" }} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: "18px" }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box sx={{
        mb: 5,
        animation: "slideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "@keyframes slideDown": {
          from: { opacity: 0, transform: "translateY(-15px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}>
        <Typography variant="h5" fontWeight={800} sx={{
          color: "text.primary",
          letterSpacing: "-0.6px",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "1.5rem",
        }}>
          User Profile
        </Typography>
        <Typography variant="body2" sx={{
          color: "text.secondary",
          mt: 1,
          fontSize: "0.95rem",
          fontWeight: 500,
        }}>
          Your account details and access permissions
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
        {/* LEFT – Premium Identity Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{
            borderRadius: "20px",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
            overflow: "hidden",
            bgcolor: "background.paper",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
              transform: "translateY(-4px)",
            },
            animation: "slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "@keyframes slideIn": {
              from: { opacity: 0, transform: "translateY(20px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}>
            {/* Gradient banner */}
            <Box sx={{
              height: 120,
              background: gradient,
              position: "relative",
              overflow: "hidden",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
                animation: "shine 3s infinite",
                "@keyframes shine": {
                  "0%": { transform: "translateX(-100%)" },
                  "100%": { transform: "translateX(100%)" },
                },
              },
            }} />

            <Box sx={{ px: 3.5, pb: 3.5, textAlign: "center", mt: "-56px" }}>
              <Avatar sx={{
                width: 110,
                height: 110,
                fontSize: "2.5rem",
                fontWeight: 800,
                background: gradient,
                border: `5px solid ${isDark ? "#111827" : "#fff"}`,
                boxShadow: `
                  0 12px 28px ${alpha(accent, 0.45)},
                  inset 0 1px 0 rgba(255,255,255,0.15)
                `,
                mx: "auto",
                mb: 2.5,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                animation: "scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards",
                "@keyframes scaleIn": {
                  from: { opacity: 0, transform: "scale(0.8)" },
                  to: { opacity: 1, transform: "scale(1)" },
                },
              }}>
                {avatarLetter}
              </Avatar>

              <Typography variant="h6" fontWeight={800} sx={{
                color: "text.primary",
                mb: 0.75,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "1.2rem",
                letterSpacing: "-0.3px",
              }}>
                {displayName}
              </Typography>
              <Typography variant="body2" sx={{
                color: "text.secondary",
                mb: 2.5,
                fontSize: "0.85rem",
                fontWeight: 500,
              }}>
                {email}
              </Typography>

              <Chip label={role} sx={{
                fontWeight: 700,
                borderRadius: "10px",
                px: 1.5,
                background: alpha(accent, isDark ? 0.18 : 0.12),
                color: accent,
                border: `1.5px solid ${alpha(accent, isDark ? 0.35 : 0.25)}`,
                fontSize: "0.8rem",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: alpha(accent, isDark ? 0.25 : 0.18),
                  transform: "scale(1.05)",
                },
              }} />

              <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mt: 3,
                p: 1.75,
                borderRadius: "12px",
                background: alpha("#10b981", isDark ? 0.12 : 0.08),
                border: `1.5px solid ${alpha("#10b981", isDark ? 0.25 : 0.20)}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  background: alpha("#10b981", isDark ? 0.18 : 0.12),
                  borderColor: alpha("#10b981", isDark ? 0.35 : 0.30),
                },
              }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#10b981",
                  boxShadow: "0 0 0 4px rgba(16,185,129,0.2)",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { boxShadow: "0 0 0 4px rgba(16,185,129,0.2)" },
                    "50%": { boxShadow: "0 0 0 8px rgba(16,185,129,0.1)" },
                  },
                }} />
                <Typography variant="caption" sx={{
                  color: "#10b981",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                }}>
                  Active Session
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT – Account Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{
            borderRadius: "20px",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            boxShadow: isDark
              ? "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
            bgcolor: "background.paper",
            p: { xs: 3.5, md: 4.5 },
            height: "100%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)",
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
            },
            animation: "slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "@keyframes slideInRight": {
              from: { opacity: 0, transform: "translateX(20px)" },
              to: { opacity: 1, transform: "translateX(0)" },
            },
          }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
              <Box sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                background: alpha("#6366f1", isDark ? 0.20 : 0.12),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6366f1",
                transition: "all 0.2s ease",
              }}>
                <VerifiedUserIcon fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{
                color: "text.primary",
                fontSize: "1.05rem",
                letterSpacing: "-0.2px",
              }}>
                Account Information
              </Typography>
            </Stack>

            <Stack spacing={0}>
              <InfoRow
                icon={<EmailOutlinedIcon fontSize="small" />}
                label="Email Address"
                value={email}
              />
              <Divider sx={{
                my: 2.5,
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              }} />
              <InfoRow
                icon={<FingerprintIcon fontSize="small" />}
                label="System Identifier (UID)"
                value={uid}
                mono
              />
              <Divider sx={{
                my: 2.5,
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              }} />
              <InfoRow
                icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />}
                label="Access Level"
                value={role}
                accent={accent}
              />
              <Divider sx={{
                my: 2.5,
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              }} />
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
      spacing={{ xs: 0.75, sm: 2 }}
      sx={{
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateX(4px)",
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{
          color: "text.disabled",
          display: "flex",
          alignItems: "center",
          transition: "color 0.2s ease",
        }}>
          {icon}
        </Box>
        <Typography variant="body2" sx={{
          color: "text.secondary",
          fontWeight: 500,
          fontSize: "0.9rem",
        }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" fontWeight={600} sx={{
        color: isStatus ? "#10b981" : accent ?? "text.primary",
        fontFamily: mono ? "'JetBrains Mono', 'Courier New', monospace" : "inherit",
        fontSize: mono ? "0.8rem" : "0.9rem",
        wordBreak: "break-all",
        textAlign: { xs: "left", sm: "right" },
        maxWidth: { sm: "60%" },
        letterSpacing: mono ? "0.02em" : "normal",
        padding: "0.5rem 0.75rem",
        borderRadius: "8px",
        background: mono ? "rgba(0,0,0,0.02)" : "transparent",
        transition: "all 0.2s ease",
      }}>
        {value || "—"}
      </Typography>
    </Stack>
  );
}