import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  BusinessOutlined,
  GavelOutlined,
  AssignmentOutlined,
  BarChartOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
const drawerWidth = 240;
const collapsedWidth = 72;

const menu = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlined /> },
  { label: "Entities", path: "/dashboard/entities", icon: <BusinessOutlined /> },
  { label: "Regulations", path: "/dashboard/regulations", icon: <GavelOutlined /> },
  { label: "Tasks", path: "/dashboard/tasks", icon: <AssignmentOutlined /> },
  { label: "Reports", path: "/dashboard/reports", icon: <BarChartOutlined /> },
  { label: "Settings", path: "/dashboard/settings", icon: <SettingsOutlined /> },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const content = (isDesktop: boolean) => (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        mt: { xs: 8, md: 0 },
      }}
    >
      <List sx={{ px: 1.5 }}>
        {menu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => {
                navigate(item.path);
                if (!isDesktop) onClose();
              }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                px: 2,
                minHeight: 48,
                justifyContent:
                  isDesktop && isCollapsed ? "center" : "initial",
                "&.Mui-selected": {
                  bgcolor: "primary.lighter",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: isDesktop && isCollapsed ? 0 : 40,
                  mr: isDesktop && isCollapsed ? 0 : 0,
                  color: active ? "inherit" : "text.secondary",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 500,
                  noWrap: true,
                }}
                sx={{
                  opacity: isDesktop && isCollapsed ? 0 : 1,
                  transition: "opacity 0.2s ease",
                  display: isDesktop && isCollapsed ? "none" : "block",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR (NO HOVER) */}
      <Box
        component="nav"
        sx={{
          width: isCollapsed ? collapsedWidth : drawerWidth,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 64,
            height: "calc(100vh - 64px)",
            width: isCollapsed ? collapsedWidth : drawerWidth,
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            borderRight: "0.5px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflowX: "visible",
            zIndex: 1200,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 32,
              right: -12,
              width: 26,
              height: 26,
              borderRadius: "50%",
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 1300,
              boxShadow: 1,
            }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <EastIcon fontSize="small" /> : <WestIcon fontSize="small" />}
          </Box>

          {content(true)}
        </Box>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundImage: "none",
          },
        }}
      >
        {content(false)}
      </Drawer>
    </>
  );
}