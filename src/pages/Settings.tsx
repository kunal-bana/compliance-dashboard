import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, Tooltip } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../features/users/usersApi";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import AddUserDialog from "../components/AddUserDialog";
import { updatePassword } from "firebase/auth";
import { auth } from "../services/firebase";
import * as Yup from "yup";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function Settings() {
  const role = useSelector((state: RootState) => state.auth.role);
  const currentUser = auth.currentUser;

  const { data: users = [] } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const [openAdd, setOpenAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Search and Filter States
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const gridApiRef = useRef<GridApi | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const canViewTable = role === "ADMIN" || role === "MANAGER";
  const canAdd = role === "ADMIN" || role === "MANAGER";
  const canDelete = role === "ADMIN";

  const isFilterActive = searchText !== "" || roleFilter !== "All" || statusFilter !== "All";

  const handleClearFilters = () => {
    setSearchText("");
    setRoleFilter("All");
    setStatusFilter("All");
  };

  /* ================= PASSWORD VALIDATION ================= */
  const passwordSchema = Yup.object({
    newPassword: Yup.string().min(6, "Minimum 6 characters").required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Required"),
  });

  const handleChangePassword = async () => {
    try {
      await passwordSchema.validate({ newPassword, confirmPassword });
      if (!currentUser) return;
      await updatePassword(currentUser, newPassword);
      alert("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  /* ================= AG GRID FILTER LOGIC ================= */
  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
  };

  useEffect(() => {
    if (gridApiRef.current) {
      gridApiRef.current.onFilterChanged();
    }
  }, [searchText, roleFilter, statusFilter]);

  const isExternalFilterPresent = useCallback(() => isFilterActive, [isFilterActive]);

  const doesExternalFilterPass = useCallback(
    (node: any) => {
      const user = node.data;
      const matchesSearch = user.email.toLowerCase().includes(searchText.toLowerCase()) || 
                            user.uid.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || (user.status || "Active") === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    },
    [searchText, roleFilter, statusFilter]
  );

  /* ================= AG GRID COLUMNS ================= */
  const columns = useMemo<ColDef<any>[]>(() => {
    const cols: ColDef<any>[] = [
      { field: "uid", headerName: "User ID", flex: 1.5, minWidth: 180 },
      { field: "email", headerName: "Email", flex: 2, minWidth: 220 },
      {
        field: "role",
        headerName: "Role",
        flex: 1,
        minWidth: 130,
        cellRenderer: (p: any) => (
          <Chip
            label={p.value}
            size="small"
            color={p.value === "ADMIN" ? "success" : p.value === "MANAGER" ? "info" : "primary"}
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        cellRenderer: (p: any) => (
          <Chip
            label={p.value || "Active"}
            size="small"
            sx={{
              fontWeight: 600,
              color: "#fff",
              backgroundColor: (p.value || "Active") === "Active" 
                ? theme.palette.success.main 
                : theme.palette.grey[500],
            }}
          />
        ),
      },
    ];

    if (canDelete) {
      cols.push({
        headerName: "Actions",
        minWidth: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          if (params.data.uid === currentUser?.uid) return null;
          return (
            <Tooltip title="Delete User" placement="right"arrow>
              <IconButton
                size="small"
                sx={{ color: theme.palette.error.main }}
                onClick={() => setDeleteTarget(params.data.uid)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        },
      });
    }
    return cols;
  }, [canDelete, currentUser?.uid, theme.palette]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ height: "100%", width: "100%", p: { xs: 1, md: 0 } }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Settings
      </Typography>

      {/* ================= PASSWORD CARD (Professionalized) ================= */}
      <Card sx={{ mb: 5, borderRadius: 2, maxWidth: { md: "800px" }, boxShadow: "2" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={0.5}>
            Security
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Update your account password to keep your profile secure.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
            <TextField
              type="password"
              label="New Password"
              size="small"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              type="password"
              label="Confirm Password"
              size="small"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleChangePassword}
              sx={{ px: 4, height: 40, whiteSpace: "nowrap", width: { xs: "100%", sm: "auto" } }}>
              Update
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ================= USER MANAGEMENT HEADER & FILTERS ================= */}
      {canViewTable && (
        <>
          <Stack 
            direction={{ xs: "column", md: "row" }} 
            justifyContent="space-between" 
            alignItems={{ xs: "flex-start", md: "center" }} 
            spacing={2} 
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              User Management
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
              <TextField
                placeholder="Search email/ID..."
                size="small"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ width: { xs: "100%", sm: 200 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Role"
                size="small"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="All">All Roles</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
                <MenuItem value="VIEWER">Viewer</MenuItem>
              </TextField>
              <TextField
                select
                label="Status"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
              
              {isFilterActive && (
                <Button 
                  size="small" 
                  startIcon={<ClearIcon />} 
                  onClick={handleClearFilters}
                  sx={{ color: "text.secondary", textTransform: "none" }}>
                  Clear Filter
                </Button>
              )}
            </Stack>
          </Stack>

          <Box
            className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
            sx={{
              borderRadius: 2,
              width: "100%",
              overflow: "hidden",
              border: `1px solid ${isDark ? "#333" : "#e0e0e0"}`, 
            "& .ag-root-wrapper": {
            border: "none",
            },
            "& .ag-header": {
             backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa", 
             borderBottom: `1px solid ${isDark ? "#333" : "#f0f0f0"}`,
            },
            "& .ag-row": {
            borderBottomColor: isDark ? "#333" : "#f5f5f5 !important", 
            },
            "& .ag-cell": {
            display: "flex",
            alignItems: "center",
            color: isDark ? "#ccc" : "#444",
            } 
            }}
          >
            <AgGridReact
              rowData={users}
              columnDefs={columns}
              domLayout="autoHeight"
              theme="legacy"
              onGridReady={onGridReady}
              isExternalFilterPresent={isExternalFilterPresent}
              doesExternalFilterPass={doesExternalFilterPass}
              pagination={!isMobile}
              paginationPageSize={10}
              paginationPageSizeSelector={[5, 10, 15]}
              animateRows
              defaultColDef={{
                sortable: true,
                filter: false,
                resizable: true,
              }}
            />
          </Box>

          {canAdd && (
            <Box mt={2}>
              <Button
                variant="contained"
                onClick={() => setOpenAdd(true)}
                sx={{ textTransform: "none", px: 3 }}>
                Add User
              </Button>
            </Box>
          )}
        </>
      )}

      {/* DELETE CONFIRMATION & ADD DIALOG remains same logic */}
      <Dialog 
      open={Boolean(deleteTarget)} 
      onClose={() => setDeleteTarget(null)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 }
        }}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 'bold' }}>
            <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              bgcolor: 'error.lighter', 
              color: 'error.main', 
              p: 1, 
              borderRadius: '50%' 
            }}>
              <DeleteForeverIcon fontSize="medium" />
              </Box>
              Confirm Delete
              </DialogTitle>
              <DialogContent>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                You are about to delete. This will permanently remove their profile and access.
              </Typography>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2, mt: 1 }}>
                <Button 
                onClick={() => setDeleteTarget(null)}
                sx={{ color: 'text.disabled', fontWeight: 600 }}>
                  Go Back
                </Button>
                <Button 
                color="error" 
                variant="contained" 
                onClick={handleConfirmDelete}
                autoFocus
                sx={{ 
                  fontWeight: 600, 
                  px: 3, 
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' }
                }}>
                  Delete Permanently
                </Button>
              </DialogActions>
            </Dialog>
          <AddUserDialog open={openAdd} onClose={() => setOpenAdd(false)} />      
          </Box>
    );
  }