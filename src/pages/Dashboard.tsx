import { Box } from "@mui/material";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BreadcrumbsBar from "../components/BreadcrumbsBar";
import { Outlet } from "react-router-dom";

const HEADER_HEIGHT = 64;

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default"
      }}
    >
      <Header onMenuClick={() => setMobileOpen(true)} />

      <Box
        sx={{
          position: "absolute",
          top: HEADER_HEIGHT,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          overflow: "hidden",
        }}
      >
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          {/* Breadcrumbs bar */}
          <Box
            sx={{
              px: 2,
              height: 44,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              bgcolor: "background.paper",
              borderBottom: (theme) =>
                `1px solid ${theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)"
                }`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <BreadcrumbsBar />
          </Box>

          {/* Scrollable content area */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              bgcolor: "#f0f2f7",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.18)",
                borderRadius: "8px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "rgba(0,0,0,0.3)",
              },
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.18) transparent",
            }}
          >
            <Box
              sx={{
                width: "100%",
                px: { xs: 2, sm: 3, md: 4, xl: 6 },
                py: { xs: 2, sm: 3 },
                minHeight: "100%",
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}