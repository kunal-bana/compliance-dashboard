import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
  Tooltip,
  alpha,
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

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

interface Entity {
  id: string;
  name: string;
  type: string;
  status: string;
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
  const isDark = theme.palette.mode === "dark";

  const canCreate = role === "ADMIN" || role === "MANAGER";
  const canUpdate = role === "ADMIN" || role === "MANAGER";
  const canDelete = role === "ADMIN";

  const { data = [], isLoading } = useGetEntitiesQuery();

  const isFilterActive = searchText !== "" || statusFilter !== "All";

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("All");
  };

  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
  };

  useEffect(() => {
    if (gridApiRef.current) {
      gridApiRef.current.onFilterChanged();
    }
  }, [searchText, statusFilter]);

  const isExternalFilterPresent = useCallback(() => isFilterActive, [isFilterActive]);

  const doesExternalFilterPass = useCallback(
    (node: any) => {
      const item = node.data as Entity;
      const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    },
    [searchText, statusFilter]
  );

  const baseColumns: ColDef<Entity>[] = [
    {
      field: "name",
      headerName: "Entity Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 120,
      valueFormatter: (p) =>
        p.value ? p.value.charAt(0).toUpperCase() + p.value.slice(1) : "",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: { value: string }) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "Active" ? "success" : "error"}
          sx={{ fontWeight: 600, borderRadius: "6px", fontSize: "0.75rem" }}
        />
      ),
    },
  ];

  const actionColumn: ColDef<Entity> = {
    headerName: "Actions",
    minWidth: 120,
    maxWidth: 140,
    sortable: false,
    filter: false,
    cellRenderer: (params: { data: Entity }) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {canUpdate && (
          <Tooltip title="Edit" placement="left" arrow>
            <IconButton
              size="small"
              sx={{
                color: "#3b82f6",
                borderRadius: "8px",
                "&:hover": { bgcolor: alpha("#3b82f6", 0.1) },
              }}
              onClick={() => setEditEntity(params.data)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete" placement="right" arrow>
            <IconButton
              size="small"
              sx={{
                color: "#ef4444",
                borderRadius: "8px",
                "&:hover": { bgcolor: alpha("#ef4444", 0.1) },
              }}
              onClick={() => setDeleteId(params.data.id)}
            >
              <DeleteOutlineIcon fontSize="small" />
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

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Typography color="text.secondary">Loading entities...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "black", letterSpacing: "-0.5px" }}>
          Entities
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Manage and monitor your registered business entities.
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
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flexGrow: 1 }} alignItems="center">
            <TextField
              placeholder="Search entities..."
              size="small"
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                maxWidth: { sm: 280 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                  "&:hover fieldset": { borderColor: "#6366f1" },
                  "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                },
              }}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                minWidth: { xs: "100%", sm: 140 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "rgba(0,0,0,0.1)" },
                  "&:hover fieldset": { borderColor: "#6366f1" },
                  "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                },
              }}
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
                  whiteSpace: "nowrap",
                  borderRadius: "8px",
                  "&:hover": { bgcolor: alpha("#ef4444", 0.07), color: "#ef4444" },
                }}
              >
                Clear
              </Button>
            )}
          </Stack>

          {canCreate && (
            <Button
              variant="contained"
              onClick={() => setOpen(true)}
              startIcon={<AddIcon />}
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
              Add Entity
            </Button>
          )}
        </Stack>
      </Box>

      {/* Grid */}
      <Box
        className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
        sx={{
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
          "& .ag-header-cell-label": { fontWeight: 600, color: isDark ? "#94a3b8" : "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em" },
          "& .ag-row": {
            borderBottomColor: `${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"} !important`,
          },
          "& .ag-row:hover": { bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(99,102,241,0.03)" },
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
        }}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          domLayout="autoHeight"
          theme="legacy"
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

      {/* Dialogs */}
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