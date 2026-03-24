import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/Gavel"; // Specific icon for regulations
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAddRegulationMutation } from "../features/regulations/regulationsApi";
import { usePermission } from "../hooks/usePermission";
import type { CreateRegulationInput, RegulationStatus } from "../types/regulation";

interface Props {
  open: boolean;
  onClose: () => void;
}

const schema = Yup.object({
  title: Yup.string().min(3, "Title must be at least 3 characters").required("Title is required"),
  code: Yup.string().required("Regulation code is required"),
  status: Yup.mixed<RegulationStatus>()
    .oneOf(["Active", "Inactive"])
    .required("Status is required"),
});

export default function AddRegulationDialog({ open, onClose }: Props) {
  const [addRegulation, { isLoading }] = useAddRegulationMutation();
  const canCreate = usePermission("REGULATION", "CREATE");

  if (!canCreate) return null;

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
            bgcolor: 'warning.lighter', 
            p: 1, 
            borderRadius: 1.5, 
            display: 'flex', 
            color: 'warning.main' 
          }}>
            <GavelIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>Add New Regulation</Typography>
            <Typography variant="caption" color="text.secondary">Create a new compliance framework entry</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Formik<CreateRegulationInput>
        initialValues={{ title: "", code: "", status: "Active" }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          await addRegulation(values).unwrap();
          helpers.resetForm();
          onClose();
        }}
      >
        {({ values, handleChange, handleBlur, touched, errors }) => (
          <Form>
            <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none', py: 3 }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  name="title"
                  label="Regulation Title"
                  placeholder="e.g., GDPR Compliance Article 5"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />

                <TextField
                  fullWidth
                  name="code"
                  label="Regulation Code"
                  placeholder="e.g., REG-2024-001"
                  value={values.code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.code && Boolean(errors.code)}
                  helperText={touched.code && errors.code}
                  variant="outlined"
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
                  helperText={touched.status && errors.status}
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
                color="primary"
                sx={{ 
                  borderRadius: 2, 
                  px: 4, 
                  textTransform: 'none', 
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                }}
              >
                {isLoading ? 'Saving...' : 'Add Regulation'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}