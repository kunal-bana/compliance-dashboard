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
        bgcolor: "#f5f6f8",
      }}  >
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
        }}>
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <Box
          sx={{
            px: 1.5,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            bgcolor: "background.paper",
            }}>
                <BreadcrumbsBar />
            </Box>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: 0,
              py: 0,
                  "&::-webkit-scrollbar": {
                    width: "8px",},
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",},
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(0,0,0,0.25)",
                    borderRadius: "8px",
                    border: "2px solid transparent",
                    backgroundClip: "content-box",},
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "rgba(0,0,0,0.45)",},
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(0,0,0,0.35) transparent",}}>
            <Box
              sx={{
                width: "100%",
                p: 2,
                minHeight: "100%",
                bgcolor: "background.paper",
              }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
