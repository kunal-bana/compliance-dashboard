import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Divider,
  ListItemIcon,
  Tooltip,
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
export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { handleLogout } = useAuth(); 
  const { email, role } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const displayName =
  role === "ADMIN"
    ? "Admin User"
    : role === "MANAGER"
    ? "Manager User"
    : "Viewer User";

const avatarLetter =
  email?.charAt(0).toUpperCase() ?? "?";
  return (
    <AppBar
      position="fixed"
      elevation={0} 
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "background.paper",
        color: "text.primary",
        borderBottom: "0.5px solid",
        borderColor: "divider", 
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: 64 }}>
        
        <IconButton
          onClick={onMenuClick}
          edge="start"
          sx={{ 
            display: { md: "none" }, 
            mr: 2,
            color: "text.secondary" 
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            sx={{ 
              fontWeight: 800, 
              letterSpacing: -0.5,
              display: { xs: "block", sm: "block" } 
            }}>
            Complyra
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
            <IconButton
            onClick={toggleTheme}
            sx={{
              borderColor: "divider",
              color: "text.secondary",
            }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Account settings">
            <IconButton 
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ p: 0.5, borderColor: "divider" }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  color: "text.primary",
                  fontSize: "0.875rem"
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
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 180,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {email}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 0.5 }} />

          <MenuItem
          onClick={() => {
            navigate("/dashboard/profile");
            setAnchorEl(null);
            }}>
            <ListItemIcon>
              <PersonOutlineIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>
          
          <MenuItem 
            onClick={handleLogout}
            sx={{ color: "error.main" }}>
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