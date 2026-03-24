import {
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  alpha,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useTheme, useMediaQuery } from "@mui/material";
import { useGetTasksQuery } from "../features/tasks/tasksApi";
import { useState, useMemo } from "react";
import AddTaskDialog from "../components/AddTaskDialog";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import TaskDetailDialog from "../components/TaskDetailDialog";
import type { Task } from "../features/tasks/tasksApi";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useGetEntitiesQuery } from "../features/entities/entitiesApi";
import { useGetRegulationsQuery } from "../features/regulations/regulationsApi";
import { useGetUsersQuery } from "../features/users/usersApi";
import { useLocation, useNavigate } from "react-router-dom";
import { isTaskOverdue, getTaskDisplayStatus } from "../utils/taskUtils";

export default function Tasks() {
  /* ============================
      AUTH / ROLE / NAVIGATION
  ============================ */
  const role = useSelector((state: RootState) => state.auth.role);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const filterFromState = (location.state as {
    status?: string;
    assignedTo?: string;
    overdue?: boolean;
    active?: boolean;
  }) || {};

  const canEdit = role === "ADMIN" || role === "MANAGER";
  const canDelete = role === "ADMIN";
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";

  /* ============================
      STATE & DATA
  ============================ */
  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const { data: entities = [] } = useGetEntitiesQuery();
  const { data: regulations = [] } = useGetRegulationsQuery();
  const { data: users = [] } = useGetUsersQuery();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  /* ============================
      FILTERING LOGIC
  ============================ */
  const handleClearAll = () => {
    setSearchText("");
    setStatusFilter("All");
    if (Object.keys(filterFromState).length > 0) {
      navigate("/dashboard/tasks", { replace: true, state: {} });
    }
  };

  const isAnyFilterActive =
    searchText !== "" ||
    statusFilter !== "All" ||
    Object.keys(filterFromState).length > 0;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchText && !task.title.toLowerCase().includes(searchText.toLowerCase()))
        return false;
      if (statusFilter !== "All") {
        if (statusFilter === "Overdue") {
          if (!isTaskOverdue(task)) return false;
        } else {
          if (task.status !== statusFilter) return false;
        }
      }
      if (filterFromState.assignedTo && task.assignedTo !== filterFromState.assignedTo)
        return false;
      if (filterFromState.overdue) {
        if (!isTaskOverdue(task)) return false;
      }
      if (filterFromState.active) {
        if (task.status === "Completed" || isTaskOverdue(task)) return false;
      }
      if (filterFromState.status && task.status !== filterFromState.status)
        return false;
      return true;
    });
  }, [tasks, searchText, statusFilter, filterFromState]);

  /* ============================
      MAPS (ID → NAME)
  ============================ */
  const entityMap = useMemo(
    () => Object.fromEntries(entities.map((e: any) => [e.id, e.name])),
    [entities]
  );
  const regulationMap = useMemo(
    () => Object.fromEntries(regulations.map((r: any) => [r.id, r.title])),
    [regulations]
  );
  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.uid, u.email])),
    [users]
  );

  /* ============================
      COLUMNS
  ============================ */
  const columns: ColDef<Task>[] = [
    { field: "title", headerName: "Task", flex: 2, minWidth: 220 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 130,
      cellRenderer: (p: any) => {
        const overdue = isTaskOverdue(p.data);
        const displayStatus = getTaskDisplayStatus(p.data);
        return (
          <Chip
            label={displayStatus}
            size="small"
            color={
              overdue
                ? "error"
                : p.value === "Completed"
                ? "success"
                : p.value === "In Progress"
                ? "info"
                : "warning"
            }
            sx={{ fontWeight: 600, borderRadius: "6px", fontSize: "0.75rem" }}
          />
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      minWidth: 110,
      cellRenderer: (p: any) => (
        <Chip
          label={p.value}
          size="small"
          color={p.value === "High" ? "error" : p.value === "Medium" ? "warning" : "default"}
          sx={{ fontWeight: 600, borderRadius: "6px", fontSize: "0.75rem" }}
        />
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      minWidth: 130,
      /* FIX: safely handles Firestore Timestamp objects when rendering */
      valueFormatter: (p: any) => {
        if (!p.value) return "-";
        if (p.value?.toDate) return p.value.toDate().toLocaleDateString("en-GB");
        if (typeof p.value === "string") return new Date(p.value).toLocaleDateString("en-GB");
        return "-";
      },
    },
    {
      headerName: "Details",
      minWidth: 90,
      maxWidth: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <IconButton
          size="small"
          sx={{
            color: "#6366f1",
            borderRadius: "8px",
            "&:hover": { bgcolor: alpha("#6366f1", 0.1) },
          }}
          onClick={() => setSelectedTask(params.data)}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Typography color="text.secondary">Loading tasks...</Typography>
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
          Tasks
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Assign, track and resolve compliance tasks across your team.
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
              placeholder="Search tasks..."
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
              sx={{ minWidth: { xs: "100%", sm: 160 }, ...textFieldSx }}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </TextField>
            {isAnyFilterActive && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearAll}
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

          {(isAdmin || isManager) && (
            <Button
              variant="contained"
              onClick={() => setAddOpen(true)}
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
              Add Task
            </Button>
          )}
        </Stack>

        {/* Active dashboard filter chip */}
        {(filterFromState.status ||
          filterFromState.assignedTo ||
          filterFromState.overdue ||
          filterFromState.active) && (
          <Box sx={{ mt: 1.5 }}>
            <Chip
              label={
                filterFromState.overdue
                  ? "Filter: Overdue"
                  : filterFromState.active
                  ? "Filter: Active"
                  : filterFromState.status
                  ? `Filter: ${filterFromState.status}`
                  : "Filter: My Tasks"
              }
              onDelete={handleClearAll}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ borderRadius: "8px", fontWeight: 500 }}
            />
          </Box>
        )}
      </Box>

      {/* Grid */}
      <Box className={isDark ? "ag-theme-alpine-dark" : "ag-theme-alpine"} sx={gridSx}>
        <AgGridReact
          rowData={filteredTasks}
          columnDefs={columns}
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
      <AddTaskDialog open={addOpen} onClose={() => setAddOpen(false)} />
      {selectedTask && (
        <TaskDetailDialog
          open={Boolean(selectedTask)}
          task={selectedTask}
          entityMap={entityMap}
          regulationMap={regulationMap}
          userMap={userMap}
          canEdit={canEdit}
          canDelete={canDelete}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </Box>
  );
}