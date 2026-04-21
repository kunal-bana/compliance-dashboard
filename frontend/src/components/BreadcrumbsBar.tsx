import { Breadcrumbs, Typography, Link, Box } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useThemeMode } from "../theme/ThemeContext";

export default function BreadcrumbsBar() {
  const location = useLocation();
  const { mode } = useThemeMode();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length <= 1) return null;

  return (
    <Breadcrumbs
      separator={
        <NavigateNextIcon sx={{
          fontSize: "0.9rem",
          color: mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)",
        }} />
      }
      aria-label="breadcrumb"
      sx={{ "& .MuiBreadcrumbs-ol": { alignItems: "center", flexWrap: "nowrap" } }}
    >
      <Link
        component={RouterLink} to="/dashboard"
        sx={{
          display: "flex", alignItems: "center", gap: 0.5,
          color: "primary.main",
          textDecoration: "none",
          fontSize: "0.8rem", fontWeight: 600,
          opacity: 0.85,
          "&:hover": { opacity: 1, textDecoration: "none" },
          transition: "opacity 0.15s ease",
        }}
      >
        <HomeOutlinedIcon sx={{ fontSize: "0.95rem" }} />
        Dashboard
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        if (value.toLowerCase() === "dashboard") return null;

        const displayName = value
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        return last ? (
          <Box key={to} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{
              width: 5, height: 5, borderRadius: "50%",
              bgcolor: "primary.main", opacity: 0.7,
            }} />
            <Typography sx={{
              fontSize: "0.8rem", fontWeight: 700,
              color: "text.primary",
            }}>
              {displayName}
            </Typography>
          </Box>
        ) : (
          <Link
            key={to} component={RouterLink} to={to}
            sx={{
              fontSize: "0.8rem", fontWeight: 500,
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": { color: "primary.main" },
              transition: "color 0.15s ease",
            }}
          >
            {displayName}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}