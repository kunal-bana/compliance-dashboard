import {
  AppBar, Toolbar, Typography, IconButton, Avatar,
  Menu, MenuItem, Box, Divider, ListItemIcon, Tooltip, alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeMode } from "../theme/ThemeContext";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useNavigate } from "react-router-dom";
import { useGetProfileQuery } from "../features/users/usersApi"; 
export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { handleLogout } = useAuth();
  const { data: user } = useGetProfileQuery(undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();

  const email = user?.email;
  const role = user?.role;


  const displayName =
    role === "ADMIN" ? "Admin User"
    : role === "MANAGER" ? "Manager User"
    : "Viewer User";

  const avatarLetter = email?.charAt(0).toUpperCase() ?? "?";

  const roleColor =
    role === "ADMIN" ? "#ef4444"
    : role === "MANAGER" ? "#f59e0b"
    : "#6366f1";

  return (
    <AppBar
      position="fixed" elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: mode === "dark"
          ? "0 1px 0 rgba(255,255,255,0.04)"
          : "0 1px 6px rgba(0,0,0,0.06)",
        transition: "all 0.3s ease",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: "64px !important" }}>
        <IconButton
          onClick={onMenuClick} edge="start"
          sx={{
            display: { md: "none" }, mr: 1.5,
            color: "text.secondary",
            borderRadius: "10px",
            "&:hover": { bgcolor: alpha("#6366f1", 0.08) },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: "8px",
            background: "linear-gradient(135deg, #6366f1, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(99,102,241,0.35)",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white" fillOpacity="0.95"/>
            </svg>
          </Box>
          <Typography variant="h6" sx={{
            fontWeight: 800, letterSpacing: "-0.6px",
            background: mode === "dark"
              ? "linear-gradient(135deg, #f1f5f9, #94a3b8)"
              : "linear-gradient(135deg, #0f172a, #475569)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Complyra
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                borderRadius: "10px",
                color: "text.secondary",
                width: 36, height: 36,
                "&:hover": { bgcolor: alpha("#6366f1", 0.08), color: "primary.main" },
                transition: "all 0.2s ease",
              }}
            >
              {mode === "dark"
                ? <Brightness7Icon sx={{ fontSize: 18 }} />
                : <Brightness4Icon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Account settings">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                p: 0.5, ml: 0.5,
                borderRadius: "10px",
                border: "1.5px solid",
                borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                "&:hover": { borderColor: roleColor, boxShadow: `0 0 0 3px ${alpha(roleColor, 0.12)}` },
                transition: "all 0.2s ease",
              }}
            >
              <Avatar sx={{
                width: 28, height: 28,
                background: `linear-gradient(135deg, ${roleColor}, ${alpha(roleColor, 0.7)})`,
                fontSize: "0.8rem", fontWeight: 700,
              }}>
                {avatarLetter}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1.5, minWidth: 200,
              borderRadius: "14px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: mode === "dark"
                ? "0 16px 48px rgba(0,0,0,0.5)"
                : "0 12px 40px rgba(0,0,0,0.12)",
              bgcolor: "background.paper",
              overflow: "visible",
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0, right: 16,
                width: 10, height: 10,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                transform: "translateY(-50%) rotate(45deg)",
                borderBottom: "none", borderRight: "none",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.25 }}>
              <Box sx={{
                width: 6, height: 6, borderRadius: "50%",
                bgcolor: roleColor,
                boxShadow: `0 0 0 3px ${alpha(roleColor, 0.2)}`,
              }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {displayName}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.78rem", ml: "18px" }} noWrap>
              {email}
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            onClick={() => { navigate("/dashboard/profile"); setAnchorEl(null); }}
            sx={{
              mx: 1, borderRadius: "8px", fontSize: "0.875rem",
              "&:hover": { bgcolor: alpha("#6366f1", 0.08), color: "primary.main" },
              transition: "all 0.15s ease",
            }}
          >
            <ListItemIcon>
              <PersonOutlineIcon fontSize="small" sx={{ color: "inherit" }} />
            </ListItemIcon>
            My Profile
          </MenuItem>

          <MenuItem
            onClick={handleLogout}
            sx={{
              mx: 1, mb: 0.5, borderRadius: "8px", fontSize: "0.875rem",
              color: "error.main",
              "&:hover": { bgcolor: alpha("#ef4444", 0.08) },
              transition: "all 0.15s ease",
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}