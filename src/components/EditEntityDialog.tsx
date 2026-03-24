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
import CloseIcon from "@mui/icons-material/Close";
import EditNoteIcon from "@mui/icons-material/EditNote"; // Specific icon for editing
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useUpdateEntityMutation } from "../features/entities/entitiesApi";
import { usePermission } from "../hooks/usePermission";

const schema = Yup.object({
  name: Yup.string().required("Entity name is required"),
  type: Yup.string().required("Type is required"),
  status: Yup.string().required("Status is required"),
});

export default function EditEntityDialog({ open, entity, onClose }: any) {
  const [updateEntity, { isLoading }] = useUpdateEntityMutation();
  const canUpdate = usePermission("ENTITY", "UPDATE");

  if (!entity || !canUpdate) return null;

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
      {/* PROFESSIONAL HEADER */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'primary.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'primary.main' 
          }}>
            <EditNoteIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Edit Entity</Typography>
            <Typography variant="caption" color="text.secondary">Modify organization details</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={entity}
        validationSchema={schema}
        onSubmit={async (values) => {
          await updateEntity({ id: entity.id, data: values }).unwrap();
          onClose();
        }}
      >
        {({ values, handleChange, handleBlur, touched, errors }) => (
          <Form>
            <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none', py: 3 }}>
              <Stack spacing={3}>
                <TextField 
                  fullWidth
                  name="name" 
                  label="Entity Name" 
                  value={values.name} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && (errors.name as string)} 
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <TextField 
                  select 
                  fullWidth
                  name="type" 
                  label="Entity Type" 
                  value={values.type} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  error={touched.type && Boolean(errors.type)}
                  helperText={touched.type && (errors.type as string)} 
                  InputProps={{ sx: { borderRadius: 2 } }}
                >
                  <MenuItem value="Company">Company</MenuItem>
                  <MenuItem value="Department">Department</MenuItem>
                  <MenuItem value="Division">Division</MenuItem>
                  <MenuItem value="Branch">Branch</MenuItem>
                </TextField>

                <TextField 
                  select 
                  fullWidth
                  name="status" 
                  label="Operating Status" 
                  value={values.status} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  error={touched.status && Boolean(errors.status)}
                  helperText={touched.status && (errors.status as string)}                
                    InputProps={{ sx: { borderRadius: 2 } }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={onClose}
                sx={{ 
                  color: 'text.secondary', 
                  textTransform: 'none', 
                  fontWeight: 600 
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isLoading}
                sx={{ 
                  borderRadius: 2, 
                  px: 4, 
                  textTransform: 'none', 
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                }}
              >
                {isLoading ? "Saving Changes..." : "Update Entity"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}