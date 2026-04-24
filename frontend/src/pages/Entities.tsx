import {
  Box, Typography, Chip, Button, Stack, IconButton,
  TextField, MenuItem, InputAdornment, Tooltip, alpha, CircularProgress
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import { useGetEntitiesQuery } from "../features/entities/entitiesApi";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import AddEntityDialog from "../components/AddEntityDialog";
import EditEntityDialog from "../components/EditEntityDialog";
import DeleteEntityDialog from "../components/DeleteEntityDialog";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useTheme, useMediaQuery } from "@mui/material";
import { useThemeMode } from "../theme/ThemeContext";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import EmptyState from "../components/EmptyState";
interface Entity {
  id: string; name: string; type: string; status: string;
}

/* Reusable shared styles */
function useSharedStyles(isDark: boolean) {
  const gridSx = {
    width: "100%",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid",
    borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 16px rgba(0,0,0,0.05)",
    "& .ag-root-wrapper": { border: "none", borderRadius: "16px" },
    "& .ag-header": {
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
      boxShadow: isDark
        ? "0 1px 3px rgba(0,0,0,0.12)"
        : "0 1px 3px rgba(0,0,0,0.04)",
    },
    "& .ag-header-cell-label": {
      fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: isDark ? "#475569" : "#94a3b8",
    },
    "& .ag-row": {
      borderBottomColor: `${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} !important`,
      transition: "background-color 0.2s ease",
    },
    "& .ag-row-even": { bgcolor: "transparent" },
    "& .ag-row:hover": {
      backgroundColor: `${isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)"} !important`,
      boxShadow: `inset 0 0 12px ${isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)"}`,
    },
    "& .ag-cell": {
      display: "flex", alignItems: "center",
      color: isDark ? "#cbd5e1" : "#334155",
      fontSize: "0.875rem",
    },
    "& .ag-paging-panel": {
      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
      color: isDark ? "#64748b" : "#94a3b8",
      fontSize: "0.8rem",
    },
    "& .ag-body-viewport": {
      backgroundColor: isDark ? "#111827" : "#fff",
    },
    "& .ag-row-even, & .ag-row-odd": {
      backgroundColor: "transparent",
    },
  };

  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px", fontSize: "0.875rem",
      "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" },
      "&:hover fieldset": { borderColor: "#6366f1" },
      "&.Mui-focused fieldset": { borderColor: "#6366f1", borderWidth: "1.5px" },
    },
    "& .MuiInputLabel-root": { fontSize: "0.875rem" },
  };

  return { gridSx, textFieldSx };
}

export default function Entities() {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editEntity, setEditEntity] = useState<Entity | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const gridApiRef = useRef<GridApi | null>(null);

  const role = useSelector((state: RootState) => state.auth.role);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const canCreate = role === "ADMIN" || role === "MANAGER";
  const canUpdate = role === "ADMIN" || role === "MANAGER";
  const canDelete = role === "ADMIN";

  const { data = [], isLoading, isError, refetch } = useGetEntitiesQuery(undefined);
  const isFilterActive = searchText !== "" || statusFilter !== "All";
  const { gridSx, textFieldSx } = useSharedStyles(isDark);

  const handleClearFilters = () => { setSearchText(""); setStatusFilter("All"); };

  const onGridReady = (params: any) => { gridApiRef.current = params.api; };
  useEffect(() => { if (gridApiRef.current) gridApiRef.current.onFilterChanged(); }, [searchText, statusFilter]);
  const isExternalFilterPresent = useCallback(() => isFilterActive, [isFilterActive]);
  const doesExternalFilterPass = useCallback((node: any) => {
    const item = node.data as Entity;
    return item.name.toLowerCase().includes(searchText.toLowerCase()) &&
      (statusFilter === "All" || item.status === statusFilter);
  }, [searchText, statusFilter]);

  const baseColumns: ColDef<Entity>[] = [
    { field: "name", headerName: "Entity Name", flex: 1, minWidth: 200 },
    {
      field: "type", headerName: "Type", flex: 1, minWidth: 120,
      valueFormatter: (p) => p.value ? p.value.charAt(0).toUpperCase() + p.value.slice(1) : "",
    },
    {
      field: "status", headerName: "Status", flex: 1, minWidth: 120,
      cellRenderer: (params: { value: string }) => (
        <Chip
          label={params.value}
          color={params.value?.trim().toLowerCase() === "active" ? "success" : "error"}
          sx={{
            fontWeight: 700,
            borderRadius: "8px",
            fontSize: "0.75rem",
            height: 26,
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            },
          }}
        />
      ),
    },
  ];

  const actionColumn: ColDef<Entity> = {
    headerName: "Actions", minWidth: 110, maxWidth: 130,
    sortable: false, filter: false,
    cellRenderer: (params: { data: Entity }) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {canUpdate && (
          <Tooltip title="Edit" placement="left" arrow>
            <IconButton size="small" sx={{
              color: "#6366f1",
              borderRadius: "10px",
              background: "transparent",
              transition: "all 0.2s ease",
              "&:hover": {
                background: alpha("#6366f1", 0.12),
                color: "#4f46e5",
                transform: "scale(1.1)",
              },
            }}>
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete" placement="right" arrow>
            <IconButton size="small" sx={{
              color: "#ef4444", borderRadius: "8px",
              "&:hover": { bgcolor: alpha("#ef4444", 0.1) },
            }} onClick={() => setDeleteId(params.data.id)}>
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  };

  const columnDefs = useMemo<ColDef<Entity>[]>(
    () => (canUpdate || canDelete ? [...baseColumns, actionColumn] : baseColumns),
    [canUpdate, canDelete]
  );
  if (isError) {
    return (
      <Box textAlign="center" py={6}>
        <Typography color="error" mb={2}>
          Failed to load data
        </Typography>
        <Button variant="contained" onClick={refetch}>
          Retry
        </Button>
      </Box>
    );
  }
  if (isLoading) {
    return (
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 12,
        animation: "fadeIn 0.4s ease",
      }}>
        <CircularProgress
          size={48}
          sx={{
            color: "primary.main",
            mb: 2,
          }}
        />
        <Typography sx={{
          color: "text.secondary",
          fontSize: "0.95rem",
          fontWeight: 500,
        }}>
          Loading entities...
        </Typography>
      </Box>
    );
  }
  if (!data.length) {
    return (
      <>
        <EmptyState
          title="No Entities"
          subtitle="Start by adding your first entity"
          actionText={canCreate ? "Add Entity" : undefined}
          onAction={() => setOpen(true)}
        />

        <AddEntityDialog
          open={open}
          onClose={() => setOpen(false)}
        />
      </>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} sx={{
          color: "text.primary", letterSpacing: "-0.6px",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Entities
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
          Manage and monitor your registered business entities.
        </Typography>
      </Box>

      {/* Toolbar */}
      <Box sx={{
        bgcolor: "background.paper", borderRadius: "14px",
        border: "1px solid", borderColor: "divider",
        p: { xs: 2, sm: 2.5 }, mb: 2.5,
        boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
      }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexGrow: 1 }} alignItems="center">
            <TextField
              placeholder="Search entities..." size="small" fullWidth value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: { sm: 280 }, ...textFieldSx }}
            />
            <TextField select label="Status" size="small" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 140 }, ...textFieldSx }}>
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
            {isFilterActive && (
              <Button size="small" startIcon={<ClearIcon />} onClick={handleClearFilters}
                sx={{
                  textTransform: "none", color: "text.secondary", whiteSpace: "nowrap",
                  borderRadius: "8px", fontSize: "0.8rem",
                  "&:hover": { bgcolor: alpha("#ef4444", 0.07), color: "#ef4444" },
                }}>
                Clear
              </Button>
            )}
          </Stack>
          {canCreate && (
            <Button variant="contained" onClick={() => setOpen(true)}
              startIcon={<AddIcon />} fullWidth={isMobile}
              sx={{
                textTransform: "none", borderRadius: "10px",
                px: 3, height: 38, whiteSpace: "nowrap",
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                boxShadow: "0 4px 14px rgba(99,102,241,0.32)",
                fontWeight: 600, fontSize: "0.875rem",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5, #2563eb)",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.44)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}>
              Add Entity
            </Button>
          )}
        </Stack>
      </Box>

      {/* Grid */}
      <Box className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"} sx={gridSx}>
        <AgGridReact
          rowData={data} columnDefs={columnDefs} onGridReady={onGridReady}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          domLayout="autoHeight" theme="legacy"
          pagination={!isMobile} paginationPageSize={10}
          paginationPageSizeSelector={[5, 10, 15]} animateRows
          defaultColDef={{ sortable: true, filter: false, resizable: true }}
        />
      </Box>

      <AddEntityDialog open={open} onClose={() => setOpen(false)} />
      {editEntity && (
        <EditEntityDialog open entity={editEntity} onClose={() => setEditEntity(null)} />
      )}
      {deleteId && (
        <DeleteEntityDialog open entityId={deleteId} onClose={() => setDeleteId(null)} />
      )}
    </Box>
  );
}