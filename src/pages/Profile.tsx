import {
  Box,
  Typography,
  Avatar,
  Grid,
  Chip,
  Stack,
  Divider,
  Paper,
  Container
} from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function Profile() {
  const { email, role, uid } = useSelector((state: RootState) => state.auth);
  const avatarLetter = email?.charAt(0).toUpperCase() ?? "?";

  const roleColor =
    role === "ADMIN" ? "error" : role === "MANAGER" ? "warning" : "info";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={4}>
        User Profile
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT – IDENTITY CARD */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
              height: '100%' 
            }}>
            <Stack spacing={3} alignItems="center">
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: "2.5rem",
                    bgcolor: "primary.main",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
                  }}
                >
                  {avatarLetter}
                </Avatar>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    right: 5, 
                    bgcolor: 'success.main', 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    border: '3px solid #fff' 
                  }} 
                />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {email?.split('@')[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  System {role?.toLowerCase()}
                </Typography>
              </Box>

              <Chip
                label={role}
                color={roleColor}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT – DETAILS */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 2, 
              border: "1px solid",
              borderColor: "divider",
              minHeight: '100%'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={4}>
              <VerifiedUserIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Account Information
              </Typography>
            </Stack>

            <Stack spacing={3}>
              <InfoRow label="Email Address" value={email} />
              <Divider />
              <InfoRow label="System Identifier (UID)" value={uid} />
              <Divider />
              <InfoRow label="Access Level" value={role} />
              <Divider />
              <InfoRow label="Status" value="Active / Verified" isStatus />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

function InfoRow({ label, value, isStatus }: { label: string; value?: string | null; isStatus?: boolean }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Typography 
        variant="body1" 
        fontWeight={600} 
        sx={{ color: isStatus ? 'success.main' : 'text.primary' }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}