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
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import { useDeleteTaskMutation } from "../features/tasks/tasksApi";

export default function DeleteTaskDialog({ open, taskId, onClose }: any) {
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();

  const handleDelete = async () => {
    await deleteTask(taskId).unwrap();
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
      {/* PROFESSIONAL WARNING HEADER */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'error.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'error.main' 
          }}>
            <DeleteSweepOutlinedIcon />
          </Box>
          <Typography variant="h6" fontWeight={700}>Delete Task</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <Typography variant="body1" color="text.primary" fontWeight={600} gutterBottom>
          Remove this task from the system?
        </Typography>
        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
          This action <strong>cannot be undone</strong>. All progress, comments, and attachments associated with this task will be permanently removed.
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
          {isLoading ? "Deleting..." : "Confirm Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}