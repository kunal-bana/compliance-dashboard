import { Box, Typography, Chip, Button, Stack, IconButton, Tooltip, TextField, MenuItem, InputAdornment } from "@mui/material";
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

  // Search and Filter States
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const gridApiRef = useRef<GridApi | null>(null);

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

  // Keep grid in sync with search/filter state
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

  /* =======================
      COLUMNS
  ======================= */
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
          sx={{ fontWeight: 600 }}
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
      <Stack direction="row" spacing={0.5}>
        {canManage && (
          <Tooltip title="Edit" placement="left" arrow>
            <IconButton
              size="small"
              sx={{ color: theme.palette.info.main }}
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
              sx={{ color: theme.palette.error.main }}
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

  if (isLoading) return <Typography sx={{ p: 3 }}>Loading regulations...</Typography>;

  return (
    <Box sx={{ height: "100%", width: "100%", p: { xs: 1, md: 0 } }}>
      
      {/* PROFESSIONAL RESPONSIVE HEADER */}
      <Stack 
        direction={{ xs: "column", md: "row" }} 
        spacing={2} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Regulations
        </Typography>

        {/* SEARCH & FILTERS SECTION */}
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

          {/* CLEAR BUTTON - Only shows when filter is active */}
          {isFilterActive && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ textTransform: "none", color: "text.secondary", whiteSpace: "nowrap" }}
            >
              Clear
            </Button>
          )}
        </Stack>

        {canManage && (
          <Button 
            variant="contained" 
            onClick={() => setOpenAdd(true)}
            fullWidth={isMobile}
            sx={{ textTransform: "none", px: 4, height: 40, whiteSpace: "nowrap" }}
          >
            Add Regulation
          </Button>
        )}
      </Stack>

      {/* AG-GRID TABLE */}
      <Box
        className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"}
        sx={{
          width: "100%",
          borderRadius: 2,
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

      {/* DIALOGS */}
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