import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Chip,
  Stack,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EditTaskDialog from "./EditTaskDialog";
import DeleteTaskDialog from "./DeleteTaskDialog";
import { useState } from "react";
import type { Task } from "../features/tasks/tasksApi";

interface Props {
  open: boolean;
  task: Task;
  entityMap: Record<string, string>;
  regulationMap: Record<string, string>;
  userMap: Record<string, string>;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
}

export default function TaskDetailDialog({
  open,
  task,
  entityMap,
  regulationMap,
  userMap,
  canEdit,
  canDelete,
  onClose,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const today = new Date();
  const due = task.dueDate?.toDate?.();
  const isOverdue =
    due &&
    due < today &&
    task.status !== "Completed";
  // Helper for consistent label styling
  const DataLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        display: "block",
        mb: 0.5,
      }}
    >
      {children}
    </Typography>
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        {/* ENHANCED HEADER */}
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                bgcolor: "primary.lighter",
                p: 1,
                borderRadius: 1.5,
                display: "flex",
                color: "primary.main",
              }}
            >
              <AssignmentIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {task.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Task ID: {task.id.slice(0, 8).toUpperCase()}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderTop: "none", borderBottom: "none", py: 3 }}>
          <Grid container spacing={4}>
            {/* LEFT COLUMN: PRIMARY INFO */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                <Box>
                  <DataLabel>Entity</DataLabel>
                  <Typography variant="body1" fontWeight={500}>
                    {entityMap[task.entityId] || "—"}
                  </Typography>
                </Box>

                <Box>
                  <DataLabel>Regulation Mapping</DataLabel>
                  <Typography variant="body1" fontWeight={500}>
                    {regulationMap[task.regulationId] || "—"}
                  </Typography>
                </Box>

                <Box>
                  <DataLabel>Assigned To</DataLabel>
                  <Typography variant="body1" fontWeight={500}>
                    {userMap[task.assignedTo] || "—"}
                  </Typography>
                </Box>

                <Box>
                  <DataLabel>Due Date</DataLabel>
                  <Typography variant="body1" fontWeight={600} color="primary.main">
                    {task.dueDate?.toDate
                      ? task.dueDate.toDate().toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })
                      : "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            {isOverdue && (
              <Typography
              variant="caption"
              color="error"
              sx={{ mt: 1, display: "block" }}>
                This task is overdue. Update due date to modify status.
              </Typography>
            )}
            {/* RIGHT COLUMN: METADATA & CHIPS */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                <Box>
                  <DataLabel>Status & Priority</DataLabel>
                  <Stack direction="row" spacing={1} mt={0.5}>
                    <Chip
                      label={isOverdue ? "Overdue" :task.status}
                      size="small"
                      color={
                        isOverdue? "error"
                        : task.status === "Completed"? "success"
                        : task.status === "In Progress"? "info"
                        : "warning"
                      }
                      variant="outlined"
                      sx={{ fontWeight: 600, borderRadius: 1.5 }}
                    />
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderRadius: 1.5,
                        bgcolor: "grey.100",
                      }}
                    />
                  </Stack>
                </Box>

                <Box>
                  <DataLabel>Created By</DataLabel>
                  <Typography variant="body2">{userMap[task.createdBy] || "—"}</Typography>
                </Box>

                <Box>
                  <DataLabel>System Created At</DataLabel>
                  <Typography variant="body2" color="text.secondary">
                    {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleString() : "—"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* FULL WIDTH: DESCRIPTION */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
                <DataLabel>Description</DataLabel>
                <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line" }}>
                  {task.description || "No description provided for this task."}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              width: { xs: "100%", sm: "auto" },
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            Close
          </Button>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "center", sm: "flex-end" },
            }}
          >
            {canEdit && (
              <Button
                variant="contained"
                disabled={isOverdue}
                onClick={() => setEditOpen(true)}
                sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
              >
                Edit Task
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteOpen(true)}
                sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
              >
                Delete
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Logic for sub-dialogs remains exactly the same */}
      {editOpen && (
        <EditTaskDialog open={editOpen} task={task} onClose={() => setEditOpen(false)} />
      )}

      {deleteOpen && (
        <DeleteTaskDialog
          open={deleteOpen}
          taskId={task.id}
          onClose={() => {
            setDeleteOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}