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
import EditNoteIcon from "@mui/icons-material/EditNote";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useUpdateRegulationMutation } from "../features/regulations/regulationsApi";
import { usePermission } from "../hooks/usePermission";
import type { RegulationStatus } from "../types/regulation";

const schema = Yup.object({
  title: Yup.string().required("Title is required"),
  code: Yup.string().required("Code is required"),
  status: Yup.mixed<RegulationStatus>()
    .oneOf(["Active", "Inactive"])
    .required(),
});

export default function EditRegulationDialog({ open, regulation, onClose }: any) {
  const [updateRegulation, { isLoading }] = useUpdateRegulationMutation();
  const canUpdate = usePermission("REGULATION", "UPDATE");

  if (!regulation || !canUpdate) return null;

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
      {/* RESPONSIVE HEADER */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'warning.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'warning.main' 
          }}>
            <EditNoteIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Edit Regulation</Typography>
            <Typography variant="caption" color="text.secondary">Update compliance framework details</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik
        initialValues={regulation}
        validationSchema={schema}
        onSubmit={async (values) => {
          await updateRegulation({ id: regulation.id, data: values }).unwrap();
          onClose();
        }}
      >
        {({ values, handleChange, handleBlur, touched, errors }) => (
          <Form>
            <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none', py: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <TextField 
                  fullWidth
                  name="title" 
                  label="Regulation Title" 
                  placeholder="e.g., GDPR Compliance Section 4"
                  value={values.title} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && (errors.title as string)} 
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <TextField 
                  fullWidth
                  name="code" 
                  label="Reference Code" 
                  placeholder="e.g., REG-2024-01"
                  value={values.code} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                  error={touched.code && Boolean(errors.code)}
                  helperText={touched.code && (errors.code as string)} 
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <TextField 
                  select 
                  fullWidth
                  name="status" 
                  label="Status" 
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

            <DialogActions sx={{ 
              p: 3, 
              pt: 1,
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              gap: { xs: 1.5, sm: 0 } 
            }}>
              <Button 
                fullWidth={false}
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
                type="submit" 
                variant="contained" 
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
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}