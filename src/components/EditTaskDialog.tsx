import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useUpdateTaskMutation } from "../features/tasks/tasksApi";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import type { TaskStatus } from "../features/tasks/tasksApi";
import CloseIcon from "@mui/icons-material/Close";
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import { Timestamp } from "firebase/firestore";
interface Props {
  open: boolean;
  task: any;
  onClose: () => void;
}

export default function EditTaskDialog({ open, task, onClose }: Props) {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const role = useSelector((state: RootState) => state.auth.role);

  const isAdmin = role === "ADMIN";

  /* -----------------------------
      LOCAL FORM STATE (Unchanged)
  ----------------------------- */
  const [status, setStatus] = useState<TaskStatus>("Pending");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setDueDate(
        task.dueDate?.toDate
          ? task.dueDate.toDate().toISOString().split("T")[0]
          : task.dueDate || ""
      );
    }
  }, [task]);

  if (!task) return null;

  /* -----------------------------
      SAVE HANDLER (Unchanged)
  ----------------------------- */
  const handleSave = async () => {
  const updateData: any = {
    status,
    dueDate: dueDate
      ? Timestamp.fromDate(new Date(dueDate))
      : null,
  };

  await updateTask({
    id: task.id,
    data: updateData,
  }).unwrap();

  onClose();
};

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
      }}
    >
      {/* BRANDED HEADER */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'primary.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'primary.main' 
          }}>
            <EditCalendarOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Edit Task</Typography>
            <Typography variant="caption" color="text.secondary">Update status and timeline</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none', py: 3 }}>
        <Stack spacing={3}>
          {/* TITLE (READ ONLY FOR MANAGER) */}
          <TextField
            label="Task Title"
            value={task.title}
            disabled={!isAdmin}
            fullWidth
            variant="filled" // Visual cue that it's often read-only
            InputProps={{ sx: { borderRadius: 2, fontWeight: 500 } }}
          />

          {/* STATUS */}
          <TextField
            select
            label="Current Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            fullWidth
            InputProps={{ sx: { borderRadius: 2 } }}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
          </TextField>

          {/* DUE DATE */}
          <TextField
            type="date"
            label="Due Date"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            InputProps={{ sx: { borderRadius: 2 } }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 1,
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        gap: { xs: 1.5, sm: 0 } 
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'text.secondary', 
            textTransform: 'none', 
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading}
          sx={{ 
            borderRadius: 2, 
            px: 4, 
            textTransform: 'none', 
            fontWeight: 700,
            width: { xs: '100%', sm: 'auto' },
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
          }}
        >
          {isLoading ? "Updating..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}