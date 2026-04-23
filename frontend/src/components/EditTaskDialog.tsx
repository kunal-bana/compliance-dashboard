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
import type { TaskStatus } from "../types/task";
import CloseIcon from "@mui/icons-material/Close";
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
interface Props {
  open: boolean;
  task: any;
  onClose: () => void;
}

export default function EditTaskDialog({ open, task, onClose }: Props) {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const role = useSelector((state: RootState) => state.auth.role);

  const isAdmin = role === "ADMIN";

  /*  LOCAL FORM STATE (Unchanged) */
  const [status, setStatus] = useState<TaskStatus>("Pending");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (task) {
      setStatus(task.status);
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
      );
    }
  }, [task]);

  if (!task) return null;

  /*  SAVE HANDLER (Unchanged) */

  const updateData = {
    status,
    dueDate: dueDate || null,
  };
  const handleSave = async () => {
    if (!task?.id) {
      console.error("Task ID missing");
      return;
    }

    try {
      await updateTask({
        id: task.id,
        data: {
          status,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        },
      }).unwrap();

      onClose();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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
            InputProps={{ sx: { borderRadius: 1, fontWeight: 500 } }}
          />

          {/* STATUS */}
          <TextField
            select
            label="Current Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            fullWidth
            InputProps={{ sx: { borderRadius: 1 } }}
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
            InputProps={{ sx: { borderRadius: 1 } }}
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
            borderRadius: 1,
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