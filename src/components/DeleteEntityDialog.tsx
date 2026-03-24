import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useDeleteEntityMutation } from "../features/entities/entitiesApi";
import { usePermission } from "../hooks/usePermission";

export default function DeleteEntityDialog({ open, entityId, onClose }: any) {
  const [deleteEntity, { isLoading }] = useDeleteEntityMutation();
  const canDelete = usePermission("ENTITY", "DELETE");

  if (!canDelete) return null;

  const handleDelete = async () => {
    await deleteEntity(entityId).unwrap();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, maxWidth: 400 }
      }}
    >
      {/* HEADER WITH ICON */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'error.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'error.main' 
          }}>
            <WarningAmberRoundedIcon />
          </Box>
          <Typography variant="h6" fontWeight={700}>Confirm Delete</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <Typography variant="body1" color="text.primary" fontWeight={500} gutterBottom>
          Are you sure you want to delete this entity?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This action is permanent and cannot be undone. All associated data linked to this entity may be affected.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          sx={{ 
            color: 'text.secondary', 
            textTransform: 'none', 
            fontWeight: 600,
            mr: 'auto'
          }}
        >
          No, Keep it
        </Button>
        <Button 
          color="error" 
          variant="contained" 
          onClick={handleDelete} 
          disabled={isLoading}
          sx={{ 
            borderRadius: 2, 
            px: 3, 
            textTransform: 'none', 
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
            '&:hover': {
              bgcolor: 'error.dark',
              boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)',
            }
          }}
        >
          {isLoading ? "Deleting..." : "Yes, Delete Entity"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}