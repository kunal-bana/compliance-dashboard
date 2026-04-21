import { Box, Typography, Button } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

export default function EmptyState({
  title,
  subtitle,
  actionText,
  onAction,
}: any) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        px: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <InboxIcon sx={{ fontSize: 60, color: "text.disabled" }} />

      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>

      <Typography color="text.secondary">
        {subtitle}
      </Typography>

      {actionText && (
        <Button variant="contained" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
}