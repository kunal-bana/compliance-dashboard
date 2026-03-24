import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  useTheme,
  Alert,
} from "@mui/material";
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useGetTasksQuery } from "../features/tasks/tasksApi";
import { useGetRegulationsQuery } from "../features/regulations/regulationsApi";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import GavelIcon from "@mui/icons-material/Gavel";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

/* ============================
   STATUS CONFIG
============================ */
const statusConfig: any = {
  Pending: {
    color: "warning",
    icon: <AssignmentIcon fontSize="small" />,
    chartColor: "#f7971e",
  },
  "In Progress": {
    color: "info",
    icon: <AutorenewIcon fontSize="small" />,
    chartColor: "#36d1dc",
  },
  Completed: {
    color: "success",
    icon: <CheckCircleIcon fontSize="small" />,
    chartColor: "#56ab2f",
  },
  Overdue: {
    color: "error",
    icon: <WarningAmberIcon fontSize="small" />,
    chartColor: "#ff416c",
  },
};

/* ============================
   DATE SAFE HANDLER
============================ */
function normalizeDate(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/* ============================
   COMPONENT
============================ */
export default function Reports() {
  const theme = useTheme();
  const role = useSelector((state: RootState) => state.auth.role);
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const navigate = useNavigate();
  const { data: tasks = [] } = useGetTasksQuery();
  const { data: regulations = [] } = useGetRegulationsQuery();

  const [selectedRegulation, setSelectedRegulation] =
    useState<string | null>(null);

  /* ============================
     OVERDUE AUTO CALCULATION
  ============================ */
  const enrichedTasks = useMemo(() => {
    return tasks.map((task: any) => {
      const due = normalizeDate(task.dueDate);

      if (task.status !== "Completed" && due && due < new Date()) {
        return { ...task, computedStatus: "Overdue" };
      }

      return { ...task, computedStatus: task.status };
    });
  }, [tasks]);
  const handlePieClick = (entry: any) => {
  if (!entry?.name) return;

  if (entry.name === "Overdue") {
    navigate("/dashboard/tasks", {
      state: { overdue: true },
    });
  } else {
    navigate("/dashboard/tasks", {
      state: { status: entry.name },
    });
  }
};

  /* ============================
     ROLE BASED FILTER
  ============================ */
  const roleTasks =
    role === "VIEWER"
      ? enrichedTasks.filter((t: any) => t.assignedTo === currentUserId)
      : enrichedTasks;

  /* ============================
     REGULATION FILTER
  ============================ */
  const filteredTasks = selectedRegulation
    ? roleTasks.filter((t: any) => t.regulationId === selectedRegulation)
    : roleTasks;

  /* ============================
     STATUS SUMMARY
  ============================ */
  const statusSummary = {
    Pending: filteredTasks.filter(
      (t: any) => t.computedStatus === "Pending"
    ).length,
    "In Progress": filteredTasks.filter(
      (t: any) => t.computedStatus === "In Progress"
    ).length,
    Completed: filteredTasks.filter(
      (t: any) => t.computedStatus === "Completed"
    ).length,
    Overdue: filteredTasks.filter(
      (t: any) => t.computedStatus === "Overdue"
    ).length,
  };

  /* ============================
     PIE CHART DATA
  ============================ */
  const pieData = Object.entries(statusSummary).map(
    ([status, count]) => ({
      name: status,
      value: count,
      color: statusConfig[status].chartColor,
    })
  );

  /* ============================
     MONTHLY LINE DATA
  ============================ */
  const lineData = useMemo(() => {
  const monthMap: Record<string, number> = {};

  filteredTasks.forEach((task: any) => {
    const date = normalizeDate(task.createdAt);
    if (!date) return;

    const year = date.getFullYear();
    const monthIndex = date.getMonth(); // 0–11

    const key = `${year}-${monthIndex}`; // sortable key
    monthMap[key] = (monthMap[key] || 0) + 1;
  });

  // Sort chronologically
  const sortedEntries = Object.entries(monthMap).sort(
    ([a], [b]) => {
      const [yearA, monthA] = a.split("-").map(Number);
      const [yearB, monthB] = b.split("-").map(Number);

      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    }
  );

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return sortedEntries.map(([key, count]) => {
    const [, monthIndex] = key.split("-").map(Number);
    return {
      month: monthNames[monthIndex],
      count,
    };
  });
}, [filteredTasks]);

  /* ============================
     RENDER
  ============================ */
  return (
    <Box sx={{ height: "100%", width: "100%", p: { xs: 1, md: 0 } }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Reports & Analytics
      </Typography>

      {/* ============================
         STATUS SUMMARY CARDS
      ============================ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(statusSummary).map(([status, count]) => {
          const config = statusConfig[status];

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={status}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        {status}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {count}
                      </Typography>
                    </Stack>

                    <Chip
                      icon={config.icon}
                      label=""
                      color={config.color}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {/* ============================
         FILTER INFO
      ============================ */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Tap on a regulation card below to filter tasks by regulation.
      </Alert>

      {/* ============================
         REGULATIONS
      ============================ */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Tasks by Regulation
      </Typography>
      {selectedRegulation && (
        <Box mb={3}>
          <Chip
            label="Regulation Filter Active"
            onDelete={() => setSelectedRegulation(null)}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
      <Grid container spacing={3}>
        {regulations.map((reg: any) => {
          const count = roleTasks.filter(
            (t: any) => t.regulationId === reg.id
          ).length;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={reg.id}>
              <Card
                onClick={() =>
                  setSelectedRegulation(
                    selectedRegulation === reg.id ? null : reg.id22
                  )
                }
                sx={{
                  borderRadius: 2,
                  cursor: "pointer",
                  boxShadow:2,
                  border:
                    selectedRegulation === reg.id
                      ? `2px solid ${theme.palette.primary.main}`
                      : "none",
                  transition: "0.1s",
                  "&:hover": { transform: "translateY(-2px)",border:"white solid" }
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1}>
                      <GavelIcon fontSize="small" />
                      <Typography fontWeight={600}>
                        {reg.title}
                      </Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Code: {reg.code}
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mt={2}
                    >
                      <Chip
                        label={`${count} Tasks`}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={reg.status}
                        color={
                          reg.status === "Active"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ============================
         CHARTS SECTION
      ============================ */}
      <Grid container spacing={4} sx={{ mt: 4 }}>
        {/* LINE CHART */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 2, p: 2,boxShadow: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Tasks Created (Monthly)
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#667eea" stopOpacity={0.1} />
                </linearGradient>
                </defs>
                <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
                opacity={0.3}/>
                <XAxis
                dataKey="month"
                tick={{ fontSize: 13 }}
                axisLine={false}
                tickLine={false}/>
                <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}/>
                <ReTooltip
                contentStyle={{
                borderRadius: 6,
                border: "none",
                boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
              }}/>
              <Legend />
              <Line
              type="monotone"
              dataKey="count"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              fill="url(#lineGradient)"
              style={{ outline: "none" }}
              isAnimationActive/>
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* PIE CHART */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 2, p: 2,boxShadow: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Task Status Distribution
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="gradPending" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f7971e" />
                    <stop offset="100%" stopColor="#ffd200" />
                  </linearGradient>

                  <linearGradient id="gradProgress" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#36d1dc" />
                    <stop offset="100%" stopColor="#5b86e5" />
                  </linearGradient>

                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#56ab2f" />
                    <stop offset="100%" stopColor="#a8e063" />
                  </linearGradient>

                  <linearGradient id="gradOverdue" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff416c" />
                    <stop offset="100%" stopColor="#ff4b2b" />
                  </linearGradient>
                </defs>
                <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                paddingAngle={4}
                stroke="none"
                style={{ outline: "none",cursor: "pointer" }}
                isAnimationActive
                onClick={(data) => handlePieClick(data)}
                activeShape={{ stroke: "#fff", strokeWidth: 2 }}>
                  {pieData.map((entry, index) => {
                    const gradientMap: any = {
                      Pending: "url(#gradPending)",
                      "In Progress": "url(#gradProgress)",
                      Completed: "url(#gradCompleted)",
                      Overdue: "url(#gradOverdue)",
                    };
                  return (
                  <Cell
                  key={index}
                  fill={gradientMap[entry.name]}/>
                );
                })}
                </Pie>
              <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 14 }}/>
              <ReTooltip
              contentStyle={{
                borderRadius: 6,
                border: "none",
                boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",}}
                />
            </PieChart>
          </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}