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
  alpha,
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
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
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
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

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

  const isFilterActive =
    searchText !== "" || roleFilter !== "All" || statusFilter !== "All";

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
    setPasswordError("");
    setPasswordSuccess(false);
    try {
      await passwordSchema.validate({ newPassword, confirmPassword });
      if (!currentUser) return;
      await updatePassword(currentUser, newPassword);
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message);
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

  const isExternalFilterPresent = useCallback(
    () => isFilterActive,
    [isFilterActive]
  );

  const doesExternalFilterPass = useCallback(
    (node: any) => {
      const user = node.data;
      const matchesSearch =
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.uid.toLowerCase().includes(searchText.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (user.status || "Active") === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    },
    [searchText, roleFilter, statusFilter]
  );

  /* ================= COLUMNS ================= */
  const columns = useMemo<ColDef<any>[]>(() => {
    const cols: ColDef<any>[] = [
      { field: "uid", headerName: "User ID", flex: 1.5, minWidth: 180 },
      { field: "email", headerName: "Email", flex: 2, minWidth: 220 },
      {
        field: "role",
        headerName: "Role",
        flex: 1,
        minWidth: 130,
        cellRenderer: (p: any) => {
          const colorMap: any = {
            ADMIN: { bg: alpha("#ef4444", 0.1), color: "#ef4444" },
            MANAGER: { bg: alpha("#f59e0b", 0.1), color: "#d97706" },
            VIEWER: { bg: alpha("#6366f1", 0.1), color: "#6366f1" },
          };
          const c = colorMap[p.value] ?? colorMap.VIEWER;
          return (
            <Chip
              label={p.value}
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: "6px",
                fontSize: "0.75rem",
                bgcolor: c.bg,
                color: c.color,
              }}
            />
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        cellRenderer: (p: any) => {
          const active = (p.value || "Active") === "Active";
          return (
            <Chip
              label={p.value || "Active"}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: "6px",
                fontSize: "0.75rem",
                bgcolor: active ? alpha("#10b981", 0.1) : alpha("#94a3b8", 0.12),
                color: active ? "#10b981" : "#64748b",
              }}
            />
          );
        },
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
            <Tooltip title="Delete User" placement="right" arrow>
              <IconButton
                size="small"
                sx={{
                  color: "#ef4444",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: alpha("#ef4444", 0.1) },
                }}
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
  }, [canDelete, currentUser?.uid]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget);
    setDeleteTarget(null);
  };

  const gridSx = {
    width: "100%",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.07)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    "& .ag-root-wrapper": { border: "none", borderRadius: "14px" },
    "& .ag-header": {
      backgroundColor: isDark ? "#1e293b" : "#f8fafc",
      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
    },
    "& .ag-header-cell-label": {
      fontWeight: 600,
      color: isDark ? "#94a3b8" : "#475569",
      fontSize: "0.8rem",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
    "& .ag-row": {
      borderBottomColor: `${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"} !important`,
    },
    "& .ag-cell": {
      display: "flex",
      alignItems: "center",
      color: isDark ? "#cbd5e1" : "#334155",
      fontSize: "0.875rem",
    },
    "& .ag-paging-panel": {
      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      color: isDark ? "#94a3b8" : "#64748b",
    },
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
      "&:hover fieldset": { borderColor: "#6366f1" },
      "&.Mui-focused fieldset": { borderColor: "#6366f1" },
    },
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "black", letterSpacing: "-0.5px" }}>
          Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Manage account security and platform users.
        </Typography>
      </Box>

      {/* Security Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 4, height: 22, borderRadius: "2px", background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />
        <Typography variant="h6" fontWeight={700} sx={{ color: "black" }}>
          Security
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          mb: 5,
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          maxWidth: { md: "860px" },
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: alpha("#6366f1", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6366f1",
              }}
            >
              <LockOutlinedIcon fontSize="small" />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "black" }}>
              Change Password
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
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
              sx={textFieldSx}
            />
            <TextField
              type="password"
              label="Confirm Password"
              size="small"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={textFieldSx}
            />
            <Button
              variant="contained"
              onClick={handleChangePassword}
              sx={{
                px: 3.5,
                height: 40,
                whiteSpace: "nowrap",
                width: { xs: "100%", sm: "auto" },
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5, #2563eb)",
                  boxShadow: "0 6px 18px rgba(99,102,241,0.45)",
                },
              }}
            >
              Update
            </Button>
          </Stack>

          {passwordError && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: "10px",
                bgcolor: alpha("#ef4444", 0.08),
                border: `1px solid ${alpha("#ef4444", 0.2)}`,
              }}
            >
              <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 500 }}>
                {passwordError}
              </Typography>
            </Box>
          )}
          {passwordSuccess && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: "10px",
                bgcolor: alpha("#10b981", 0.08),
                border: `1px solid ${alpha("#10b981", 0.2)}`,
              }}
            >
              <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 500 }}>
                Password updated successfully.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Management */}
      {canViewTable && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 4, height: 22, borderRadius: "2px", background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: "black" }}>
              User Management
            </Typography>
          </Box>

          {/* Toolbar */}
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: "14px",
              border: "1px solid rgba(0,0,0,0.07)",
              p: { xs: 2, sm: 2.5 },
              mb: 2.5,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexGrow: 1 }} alignItems="center" flexWrap="wrap">
                <TextField
                  placeholder="Search email / UID..."
                  size="small"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: { xs: "100%", sm: 220 }, ...textFieldSx }}
                />
                <TextField
                  select
                  label="Role"
                  size="small"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  sx={{ minWidth: { xs: "100%", sm: 130 }, ...textFieldSx }}
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
                  sx={{ minWidth: { xs: "100%", sm: 130 }, ...textFieldSx }}
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
                    sx={{
                      textTransform: "none",
                      color: "#64748b",
                      borderRadius: "8px",
                      whiteSpace: "nowrap",
                      "&:hover": { bgcolor: alpha("#ef4444", 0.07), color: "#ef4444" },
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Stack>

              {canAdd && (
                <Button
                  variant="contained"
                  onClick={() => setOpenAdd(true)}
                  startIcon={<PersonAddOutlinedIcon />}
                  fullWidth={isMobile}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 3,
                    height: 40,
                    whiteSpace: "nowrap",
                    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                    fontWeight: 600,
                    "&:hover": {
                      background: "linear-gradient(135deg, #4f46e5, #2563eb)",
                      boxShadow: "0 6px 18px rgba(99,102,241,0.45)",
                    },
                  }}
                >
                  Add User
                </Button>
              )}
            </Stack>
          </Box>

          {/* Grid */}
          <Box
            className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
            sx={gridSx}
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
              defaultColDef={{ sortable: true, filter: false, resizable: true }}
            />
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700, color: "black" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha("#ef4444", 0.1),
              color: "#ef4444",
              p: 1,
              borderRadius: "10px",
            }}
          >
            <DeleteForeverIcon fontSize="medium" />
          </Box>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 1, lineHeight: 1.7 }}>
            You are about to permanently delete this user. This will remove their profile and revoke all access.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, mt: 1, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{
              color: "#64748b",
              fontWeight: 600,
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": { bgcolor: alpha("#0f172a", 0.05) },
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            autoFocus
            sx={{
              fontWeight: 700,
              px: 3,
              borderRadius: "10px",
              textTransform: "none",
              bgcolor: "#ef4444",
              boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
              "&:hover": {
                bgcolor: "#dc2626",
                boxShadow: "0 6px 18px rgba(239,68,68,0.45)",
              },
            }}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      <AddUserDialog open={openAdd} onClose={() => setOpenAdd(false)} />
    </Box>
  );
}