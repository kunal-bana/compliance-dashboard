import { Box, Typography, Chip, Button, Stack, IconButton, TextField, MenuItem, InputAdornment, Tooltip } from "@mui/material";
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
  
  // Search and Filter States
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

  // Helper to check if filters are active
  const isFilterActive = searchText !== "" || statusFilter !== "All";

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("All");
  };

  /* =======================
      AG-GRID FILTER LOGIC
  ======================= */
  const onGridReady = (params: any) => {
    gridApiRef.current = params.api;
  };

  // Trigger grid refresh when filters change
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
    { field: "name", headerName: "Entity Name", flex: 1, minWidth: 200 },
    { 
      field: "type", 
      headerName: "Type", 
      flex: 1, 
      minWidth: 120,
      valueFormatter: (p) => p.value ? p.value.charAt(0).toUpperCase() + p.value.slice(1) : ""
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: { value: string }) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "Active" ? "success" : "error"}
          sx={{ fontWeight: 600 }}
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
      <Stack direction="row" spacing={0.5}>
        {canUpdate && (
          <Tooltip title="Edit" placement="left" arrow>
          <IconButton size="small" sx={{ color: theme.palette.info.main }} onClick={() => setEditEntity(params.data)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete" placement="right" arrow>
          <IconButton size="small" sx={{ color: theme.palette.error.main }} onClick={() => setDeleteId(params.data.id)}>
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

  if (isLoading) return <Typography sx={{ p: 3 }}>Loading entities...</Typography>;

  return (
    <Box sx={{ height: "100%", width: "100%", p: { xs: 1, md: 0 } }}>
      
      {/* Responsive Header */}
      <Stack 
        direction={{ xs: "column", md: "row" }} 
        spacing={2} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Entities
        </Typography>

        {/* Filters and Search Area */}
        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          alignItems="center"
          sx={{ width: { xs: "100%", md: "auto" }, flexGrow: 1, px: { md: 4 } }}
        >
          <TextField
            placeholder="Search by name..."
            size="small"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 150 } }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>

          {/* Conditional Clear Button */}
          {isFilterActive && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ textTransform: "none", color: "text.secondary", whiteSpace: "nowrap" }}>
              Clear Filter
            </Button>
          )}
        </Stack>

        {canCreate && (
          <Button 
            variant="contained" 
            onClick={() => setOpen(true)}
            fullWidth={isMobile}
            sx={{ textTransform: "none", px: 4, height: 40, whiteSpace: "nowrap" }}
          >
            Add Entity
          </Button>
        )}
      </Stack>

      {/* Grid Container */}
      <Box
      className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 2,
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
     }}>
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
      flex: 1, // Ensures columns fill the width professionally
    }}
  />
</Box>

      {/* Dialogs remain unchanged */}
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