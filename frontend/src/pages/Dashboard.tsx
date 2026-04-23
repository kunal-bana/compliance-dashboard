import { Box } from "@mui/material";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BreadcrumbsBar from "../components/BreadcrumbsBar";
import { Outlet } from "react-router-dom";
import { useThemeMode } from "../theme/ThemeContext";
import { useLocation } from "react-router-dom";
const HEADER_HEIGHT = 64;
export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode } = useThemeMode();
  const location = useLocation();
  const isDashboardHome = location.pathname === "/dashboard";
  return (
    <Box sx={{
      height: "100vh",
      overflow: "hidden",
      overflowX: "hidden",
      bgcolor: "background.default",
      transition: "background-color 0.3s ease",
    }}>
      <Header onMenuClick={() => setMobileOpen(true)} />

      <Box sx={{
        position: "absolute",
        top: HEADER_HEIGHT,
        left: 0, right: 0, bottom: 0,
        display: "flex",
        overflow: "hidden",
      }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <Box sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}>
          {/* Breadcrumbs bar (hide on dashboard home) */}
          {!isDashboardHome && (
            <Box sx={{
              px: { xs: 2, sm: 3 },
              height: 46,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              bgcolor: "background.paper",
              borderBottom: (theme) =>
                `1px solid ${theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)"}`,
              boxShadow: mode === "dark"
                ? "0 1px 0 rgba(255,255,255,0.03)"
                : "0 1px 4px rgba(0,0,0,0.04)",
              transition: "all 0.3s ease",
            }}>
              <BreadcrumbsBar />
            </Box>
          )}
          {/* Scrollable content area */}
          <Box sx={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            bgcolor: "background.default",
            transition: "background-color 0.3s ease",
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.14)",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: mode === "dark" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.24)",
            },
            scrollbarWidth: "thin",
            scrollbarColor: mode === "dark"
              ? "rgba(255,255,255,0.12) transparent"
              : "rgba(0,0,0,0.14) transparent",
          }}>
            <Box sx={{
              width: "100%",
              maxWidth: "100vw",
              overflowX: "hidden",
              px: { xs: 2, sm: 2, md: 3, xl: 4 },
              py: { xs: 2, sm: 2 },
              minHeight: "100%",
            }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}