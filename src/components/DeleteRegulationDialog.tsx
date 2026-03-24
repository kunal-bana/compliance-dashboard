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
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { useDeleteRegulationMutation } from "../features/regulations/regulationsApi";
import { usePermission } from "../hooks/usePermission";

export default function DeleteRegulationDialog({ open, regulationId, onClose }: any) {
  const [deleteRegulation, { isLoading }] = useDeleteRegulationMutation();
  const canDelete = usePermission("REGULATION", "DELETE");

  if (!canDelete) return null;

  const handleDelete = async () => {
    await deleteRegulation(regulationId).unwrap();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, maxWidth: 420 }
      }}
    >
      {/* HEADER SECTION */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'error.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'error.main' 
          }}>
            <ReportProblemOutlinedIcon />
          </Box>
          <Typography variant="h6" fontWeight={700}>Delete Regulation</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <Typography variant="body1" color="text.primary" fontWeight={600} gutterBottom>
          Permanently remove this regulation?
        </Typography>
        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
          This action <strong>cannot be undone</strong>. Deleting this regulation may affect existing tasks and compliance mappings currently active in the system.
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
          Cancel
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
          {isLoading ? "Removing..." : "Delete Regulation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}