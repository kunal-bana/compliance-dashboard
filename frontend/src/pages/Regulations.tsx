import {
  Box, Typography, Chip, Button, Stack, IconButton, Tooltip,
  TextField, MenuItem, InputAdornment, alpha, CircularProgress
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import { useGetRegulationsQuery } from "../features/regulations/regulationsApi";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import type { Regulation } from "../types/regulation";
import { useTheme, useMediaQuery } from "@mui/material";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import EmptyState from "../components/EmptyState";
import AddRegulationDialog from "../components/AddRegulationDialog";
import EditRegulationDialog from "../components/EditRegulationDialog";
import DeleteRegulationDialog from "../components/DeleteRegulationDialog";
import { useThemeMode } from "../theme/ThemeContext";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function Regulations() {
  const role = useSelector((state: RootState) => state.auth.role);
  const canManage = role === "ADMIN" || role === "MANAGER";
  const canDelete = role === "ADMIN";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const { data = [], isLoading, isError, refetch } = useGetRegulationsQuery(undefined);
  const [openAdd, setOpenAdd] = useState(false);
  const [editRegulation, setEditRegulation] = useState<Regulation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const gridApiRef = useRef<GridApi | null>(null);

  const isFilterActive = searchText !== "" || statusFilter !== "All";
  const handleClearFilters = () => { setSearchText(""); setStatusFilter("All"); };

  const onGridReady = (params: any) => { gridApiRef.current = params.api; };
  useEffect(() => { if (gridApiRef.current) gridApiRef.current.onFilterChanged(); }, [searchText, statusFilter]);
  const isExternalFilterPresent = useCallback(() => isFilterActive, [isFilterActive]);
  const doesExternalFilterPass = useCallback((node: any) => {
    const item = node.data as Regulation;
    return item.title.toLowerCase().includes(searchText.toLowerCase()) &&
      (statusFilter === "All" || item.status === statusFilter);
  }, [searchText, statusFilter]);

  const baseColumns: ColDef<Regulation>[] = [
    { field: "title", headerName: "Regulation", flex: 1, minWidth: 240 },
    { field: "code", headerName: "Code", flex: 1, minWidth: 140 },
    {
      field: "status", headerName: "Status", flex: 1, minWidth: 120,
      cellRenderer: (p: { value: string }) => (
        <Chip label={p.value} color={p.value === "Active" ? "success" : "error"}
          size="small" sx={{ fontWeight: 600, borderRadius: "6px", fontSize: "0.72rem" }} />
      ),
    },
  ];

  const actionColumn: ColDef<Regulation> = {
    headerName: "Actions", minWidth: 110, maxWidth: 130,
    sortable: false, filter: false,
    cellRenderer: (params: { data: Regulation }) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {canManage && (
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

  const columnDefs = useMemo<ColDef<Regulation>[]>(
    () => (canManage ? [...baseColumns, actionColumn] : baseColumns),
    [canManage]
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
          Loading regulations...
        </Typography>
      </Box>
    );
  }
  if (!data.length) {
    return (
      <>
        <EmptyState
          title="No Regulations"
          subtitle="No regulations added yet"
          actionText={canManage ? "Add Regulation" : undefined}
          onAction={() => setOpenAdd(true)}
        />

        <AddRegulationDialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
        />
      </>
    );
  }
  const gridSx = {
    width: "100%", borderRadius: "16px", overflow: "hidden",
    border: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
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
      letterSpacing: "0.06em", color: isDark ? "#475569" : "#94a3b8",
    },
    "& .ag-row": {
      borderBottomColor: `${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} !important`,
      transition: "background-color 0.2s ease",
    },
    "& .ag-row:hover": {
      backgroundColor: `${isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)"} !important`,
      boxShadow: `inset 0 0 12px ${isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)"}`,
    },
    "& .ag-cell": {
      display: "flex", alignItems: "center",
      color: isDark ? "#cbd5e1" : "#334155", fontSize: "0.875rem",
    },
    "& .ag-paging-panel": {
      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
      color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.8rem",
    },
    "& .ag-body-viewport": { backgroundColor: isDark ? "#111827" : "#fff" },
    "& .ag-row-even, & .ag-row-odd": { backgroundColor: "transparent" },
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

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} sx={{
          color: "text.primary", letterSpacing: "-0.6px",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Regulations
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
          Track and manage compliance regulations across your organization.
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
              placeholder="Search regulations..." size="small" fullWidth value={searchText}
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
          {canManage && (
            <Button variant="contained" onClick={() => setOpenAdd(true)}
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
              Add Regulation
            </Button>
          )}
        </Stack>
      </Box>

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

      <AddRegulationDialog open={openAdd} onClose={() => setOpenAdd(false)} />
      {editRegulation && (
        <EditRegulationDialog open regulation={editRegulation} onClose={() => setEditRegulation(null)} />
      )}
      {deleteId && (
        <DeleteRegulationDialog open regulationId={deleteId} onClose={() => setDeleteId(null)} />
      )}
    </Box>
  );
}