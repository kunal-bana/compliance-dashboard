import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Box,
  Typography,
  Stack,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";

import { useAddTaskMutation } from "../features/tasks/tasksApi";
import { useGetEntitiesQuery } from "../features/entities/entitiesApi";
import { useGetRegulationsQuery } from "../features/regulations/regulationsApi";
import { useGetUsersQuery } from "../features/users/usersApi";
import type { RootState } from "../app/store";
import type { TaskPriority, TaskStatus } from "../features/tasks/tasksApi";
import type { User } from "../features/users/usersApi";

interface AddTaskFormValues {
  title: string;
  description?: string;
  entityId: string;
  regulationId: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

const schema = Yup.object({
  title: Yup.string().required("Title is required"),
  entityId: Yup.string().required("Entity is required"),
  regulationId: Yup.string().required("Regulation is required"),
  assignedTo: Yup.string().required("User is required"),
  dueDate: Yup.string().required("Due date is required"),
  priority: Yup.string().required(),
  status: Yup.string().required(),
});

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddTaskDialog({ open, onClose }: Props) {
  const [addTask, { isLoading }] = useAddTaskMutation();

  const { uid, role } = useSelector((state: RootState) => state.auth);
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  const { data: entities = [] } = useGetEntitiesQuery();
  const { data: regulations = [] } = useGetRegulationsQuery();
  const { data: users = [] } = useGetUsersQuery();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      {/* PROFESSIONAL HEADER */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'secondary.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'secondary.main' 
          }}>
            <AssignmentOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Create New Task</Typography>
            <Typography variant="caption" color="text.secondary">Assign compliance activities to team members</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik<AddTaskFormValues>
        initialValues={{
          title: "",
          description: "",
          entityId: "",
          regulationId: "",
          assignedTo: "",
          dueDate: "",
          priority: "Medium",
          status: "Pending",
        }}
        validationSchema={schema}
        onSubmit={async (values) => {
          await addTask({
            ...values,
            createdBy: uid!,
          }).unwrap();
          onClose();
        }}
      >
        {({ values, handleChange, errors, touched, handleBlur }) => (
          <Form>
            <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none', py: 3 }}>
              <Grid container spacing={3}>
                {/* LEFT COLUMN: IDENTIFICATION */}
                <Grid size={{xs:12, md:6}}>
                  <Stack spacing={2.5}>
                    <TextField
                      name="title"
                      label="Task Title"
                      placeholder="e.g., Annual Audit Review"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.title && !!errors.title}
                      helperText={touched.title && errors.title}
                      fullWidth
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                    
                    <TextField
                      name="description"
                      label="Task Description"
                      placeholder="Provide details about the compliance requirements..."
                      multiline
                      value={values.description}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />

                    <TextField
                      select
                      name="entityId"
                      label="Entity"
                      value={values.entityId}
                      onChange={handleChange}
                      error={touched.entityId && !!errors.entityId}
                      helperText={touched.entityId && errors.entityId}
                      fullWidth
                      InputProps={{ sx: { borderRadius: 2 } }}
                    >
                      {entities.map((entity) => (
                        <MenuItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      name="regulationId"
                      label="Regulation"
                      value={values.regulationId}
                      onChange={handleChange}
                      error={touched.regulationId && !!errors.regulationId}
                      helperText={touched.regulationId && errors.regulationId}
                      fullWidth
                      InputProps={{ sx: { borderRadius: 2 } }}
                    >
                      {regulations.map((reg) => (
                        <MenuItem key={reg.id} value={reg.id}>
                          {reg.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                </Grid>

                {/* RIGHT COLUMN: ASSIGNMENT & DEADLINES */}
                <Grid size={{xs:12, md:6}}>
                  <Stack spacing={2.5}>
                    <TextField
                      select
                      name="assignedTo"
                      label="Assign To Team Member"
                      value={values.assignedTo}
                      onChange={handleChange}
                      error={touched.assignedTo && !!errors.assignedTo}
                      helperText={touched.assignedTo && errors.assignedTo}
                      fullWidth
                      InputProps={{ sx: { borderRadius: 2 } }}
                    >
                      {users
                        .filter((u: User) => {
                          if (isAdmin) return true;
                          if (isManager) return u.role === "VIEWER";
                          return false;
                        })
                        .map((user: User) => (
                          <MenuItem key={user.uid} value={user.uid}>
                            {user.email} ({user.role})
                          </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                      type="date"
                      name="dueDate"
                      label="Submission Deadline"
                      InputLabelProps={{ shrink: true }}
                      value={values.dueDate}
                      onChange={handleChange}
                      error={touched.dueDate && !!errors.dueDate}
                      helperText={touched.dueDate && errors.dueDate}
                      fullWidth
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />

                    <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.disabled">PRIORITY & STATUS</Typography></Divider>

                    <Stack direction="row" spacing={2}>
                        <TextField
                        select
                        name="priority"
                        label="Priority"
                        value={values.priority}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ sx: { borderRadius: 2 } }}
                        >
                        <MenuItem value="Low">Low</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        </TextField>

                        <TextField
                        select
                        name="status"
                        label="Initial Status"
                        value={values.status}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ sx: { borderRadius: 2 } }}
                        >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Progress">In Progress</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        </TextField>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isLoading}
                sx={{ 
                  borderRadius: 2, 
                  px: 5, 
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' 
                }}
              >
                {isLoading ? "Saving..." : "Create Task"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}