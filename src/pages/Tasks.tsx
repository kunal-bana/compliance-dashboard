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
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef} from "ag-grid-community";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useTheme, useMediaQuery } from "@mui/material";
import { useGetTasksQuery } from "../features/tasks/tasksApi";
import { useState, useMemo} from "react";
import AddTaskDialog from "../components/AddTaskDialog";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
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
  
  // Search and Filter States
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

  const isAnyFilterActive = searchText !== "" || statusFilter !== "All" || Object.keys(filterFromState).length > 0;

  // Combine Route State Filters with UI Search/Dropdown
  const filteredTasks = useMemo(() => {
  return tasks.filter((task) => {
    if (
      searchText &&
      !task.title.toLowerCase().includes(searchText.toLowerCase())
    )
      return false;

    if (statusFilter !== "All") {
      if (statusFilter === "Overdue") {
        if (!isTaskOverdue(task)) return false;
      } else {
        if (task.status !== statusFilter) return false;
      }
    }

    if (
      filterFromState.assignedTo &&
      task.assignedTo !== filterFromState.assignedTo
    )
      return false;

    if (filterFromState.overdue) {
      if (!isTaskOverdue(task)) return false;
    }

    if (filterFromState.active) {
      if (task.status === "Completed" || isTaskOverdue(task))
        return false;
    }

    if (
      filterFromState.status &&
      task.status !== filterFromState.status
    )
      return false;

    return true;
  });
}, [tasks, searchText, statusFilter, filterFromState]);

  /* ============================
      MAPS (ID → NAME)
  ============================ */
  const entityMap = useMemo(() => Object.fromEntries(entities.map((e: any) => [e.id, e.name])), [entities]);
  const regulationMap = useMemo(() => Object.fromEntries(regulations.map((r: any) => [r.id, r.title])), [regulations]);
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.uid, u.email])), [users]);

  /* ============================
      COLUMNS
  ============================ */
  const columns: ColDef<Task>[] = [
    { field: "title", headerName: "Task", flex: 2, minWidth: 220 },
    {
  field: "status",
  headerName: "Status",
  flex: 1,
  minWidth: 120,
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
        sx={{ fontWeight: 600 }}
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
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      minWidth: 130,
      valueFormatter: (p: any) => {
        if (!p.value) return "-";
        return p.value?.toDate ? p.value.toDate().toLocaleDateString("en-GB") : p.value;
      },
    },
    {
      headerName: "View",
      minWidth: 80,
      maxWidth: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <IconButton
          size="small"
          sx={{ color: theme.palette.info.main }}
          onClick={() => setSelectedTask(params.data)}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  if (isLoading) return <Typography sx={{ p: 3 }}>Loading tasks...</Typography>;

  return (
    <Box sx={{ width: "100%", p: { xs: 1, md: 0 } }}>
      
      {/* HEADER & FILTERS */}
      <Stack 
        direction={{ xs: "column", md: "row" }} 
        spacing={2} 
        justifyContent="space-between" 
        alignItems={{ xs: "flex-start", md: "center" }}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={700}>
          Tasks
        </Typography>

        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          alignItems="center"
          sx={{ width: { xs: "100%", md: "auto" }, flexGrow: 1, px: { md: 4 } }}
        >
          <TextField
            placeholder="Search tasks..."
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
            sx={{ minWidth: { xs: "100%", sm: 160 } }}>
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
              sx={{ textTransform: "none", color: "text.secondary", whiteSpace: "nowrap" }}
            >
              Clear
            </Button>
          )}
        </Stack>

        {(isAdmin || isManager) && (
          <Button 
            variant="contained" 
            onClick={() => setAddOpen(true)}
            fullWidth={isMobile}
            sx={{ textTransform: "none", px: 4, height: 40, whiteSpace: "nowrap" }}>
            Add Task
          </Button>
        )}
      </Stack>

      {/* ACTIVE DASHBOARD FILTER CHIP */}
      {(filterFromState.status || filterFromState.assignedTo || filterFromState.overdue || filterFromState.active) && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={
              filterFromState.overdue ? "Filter: Overdue" : 
              filterFromState.active ? "Filter: Active" : 
              filterFromState.status ? `Filter: ${filterFromState.status}` : "Filter: My Tasks"
            }
            onDelete={handleClearAll}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
      )}

      {/* TABLE */}
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
          rowData={filteredTasks}
          columnDefs={columns}
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