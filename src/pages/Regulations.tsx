import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  InputAdornment,
  alpha,
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

import AddRegulationDialog from "../components/AddRegulationDialog";
import EditRegulationDialog from "../components/EditRegulationDialog";
import DeleteRegulationDialog from "../components/DeleteRegulationDialog";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function Regulations() {
  const role = useSelector((state: RootState) => state.auth.role);
  const canManage = role === "ADMIN" || role === "MANAGER";
  const canDelete = role === "ADMIN";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  const { data = [], isLoading } = useGetRegulationsQuery();

  const [openAdd, setOpenAdd] = useState(false);
  const [editRegulation, setEditRegulation] = useState<Regulation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const gridApiRef = useRef<GridApi | null>(null);

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
      const item = node.data as Regulation;
      const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    },
    [searchText, statusFilter]
  );

  const baseColumns: ColDef<Regulation>[] = [
    { field: "title", headerName: "Regulation", flex: 1, minWidth: 240 },
    { field: "code", headerName: "Code", flex: 1, minWidth: 140 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      cellRenderer: (p: { value: string }) => (
        <Chip
          label={p.value}
          color={p.value === "Active" ? "success" : "error"}
          size="small"
          sx={{ fontWeight: 600, borderRadius: "6px", fontSize: "0.75rem" }}
        />
      ),
    },
  ];

  const actionColumn: ColDef<Regulation> = {
    headerName: "Actions",
    minWidth: 120,
    maxWidth: 140,
    sortable: false,
    filter: false,
    cellRenderer: (params: { data: Regulation }) => (
      <Stack direction="row" spacing={0.5} alignItems="center">
        {canManage && (
          <Tooltip title="Edit" placement="left" arrow>
            <IconButton
              size="small"
              sx={{ color: "#3b82f6", borderRadius: "8px", "&:hover": { bgcolor: alpha("#3b82f6", 0.1) } }}
              onClick={() => setEditRegulation(params.data)}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete" placement="right" arrow>
            <IconButton
              size="small"
              sx={{ color: "#ef4444", borderRadius: "8px", "&:hover": { bgcolor: alpha("#ef4444", 0.1) } }}
              onClick={() => setDeleteId(params.data.id)}
            >
              <DeleteOutlineIcon fontSize="small" />
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

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Typography color="text.secondary">Loading regulations...</Typography>
      </Box>
    );
  }

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
          Regulations
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Track and manage compliance regulations across your organization.
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
              placeholder="Search regulations..."
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
              sx={{ maxWidth: { sm: 280 }, ...textFieldSx }}
            />
            <TextField
              select
              label="Status"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 140 }, ...textFieldSx }}
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

          {canManage && (
            <Button
              variant="contained"
              onClick={() => setOpenAdd(true)}
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
              Add Regulation
            </Button>
          )}
        </Stack>
      </Box>

      {/* Grid */}
      <Box className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"} sx={gridSx}>
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
          defaultColDef={{ sortable: true, filter: false, resizable: true }}
        />
      </Box>

      {/* Dialogs */}
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