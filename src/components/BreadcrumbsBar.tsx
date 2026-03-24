import { Breadcrumbs, Typography, Link } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

export default function BreadcrumbsBar() {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length <= 1) {
    return (null);
  }

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon sx={{ fontSize: "1rem" }} />}
      aria-label="breadcrumb"
      sx={{
        py: 1,
        "& .MuiBreadcrumbs-ol": {
          alignItems: "center",
        },
      }}
    >
      <Link
        component={RouterLink}
        to="/dashboard"
        sx={{
          display: "flex",
          alignItems: "center",
          color: "primary.main",
          textDecoration: "none",
          fontSize: "0.85rem",
          fontWeight: 500,
          "&:hover": {
            color: "primary.dark",
            textDecoration: "underline",
          },
        }}
      >
        <HomeOutlinedIcon sx={{ mr: 0.5, fontSize: "1.1rem" }} />
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
          <Typography
            key={to}
            sx={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {displayName}
          </Typography>
        ) : (
          <Link
            key={to}
            component={RouterLink}
            to={to}
            sx={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": {
                color: "primary.main",
                textDecoration: "underline",
              },
            }}
          >
            {displayName}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}