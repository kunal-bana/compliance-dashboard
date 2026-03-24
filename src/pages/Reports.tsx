import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  alpha,
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
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

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
    chartColor: "#f59e0b",
    gradient: "linear-gradient(135deg, #f7971e, #ffd200)",
    accent: "#f7971e",
  },
  "In Progress": {
    color: "info",
    icon: <AutorenewIcon fontSize="small" />,
    chartColor: "#3b82f6",
    gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
    accent: "#3b82f6",
  },
  Completed: {
    color: "success",
    icon: <CheckCircleIcon fontSize="small" />,
    chartColor: "#10b981",
    gradient: "linear-gradient(135deg, #56ab2f, #a8e063)",
    accent: "#10b981",
  },
  Overdue: {
    color: "error",
    icon: <WarningAmberIcon fontSize="small" />,
    chartColor: "#ef4444",
    gradient: "linear-gradient(135deg, #ff416c, #ff4b2b)",
    accent: "#ef4444",
  },
};

/* ============================
   DATE SAFE HANDLER
   Fixes: non-serializable Firestore Timestamp in Redux store
============================ */
function normalizeDate(value: any): Date | null {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (value instanceof Date) return value;
  return null;
}

/* ============================
   STAT CARD
============================ */
function StatCard({
  status,
  count,
}: {
  status: string;
  count: number;
}) {
  const config = statusConfig[status];
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "14px",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        overflow: "hidden",
        position: "relative",
        bgcolor: "background.paper"
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "100%",
          background: config.gradient,
        }}
      />
      <CardContent sx={{ pl: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, mb: 0.5 }}>
              {status}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: "text.primary", lineHeight: 1 }}>
              {count}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: alpha(config.accent, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: config.accent,
            }}
          >
            {config.icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ============================
   COMPONENT
============================ */
export default function Reports() {
  const role = useSelector((state: RootState) => state.auth.role);
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const navigate = useNavigate();
  const { data: tasks = [] } = useGetTasksQuery();
  const { data: regulations = [] } = useGetRegulationsQuery();

  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);

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
      navigate("/dashboard/tasks", { state: { overdue: true } });
    } else {
      navigate("/dashboard/tasks", { state: { status: entry.name } });
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
    Pending: filteredTasks.filter((t: any) => t.computedStatus === "Pending").length,
    "In Progress": filteredTasks.filter((t: any) => t.computedStatus === "In Progress").length,
    Completed: filteredTasks.filter((t: any) => t.computedStatus === "Completed").length,
    Overdue: filteredTasks.filter((t: any) => t.computedStatus === "Overdue").length,
  };

  /* ============================
     PIE CHART DATA
  ============================ */
  const pieData = Object.entries(statusSummary).map(([status, count]) => ({
    name: status,
    value: count,
    color: statusConfig[status].chartColor,
  }));

  /* ============================
     MONTHLY LINE DATA
  ============================ */
  const lineData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    filteredTasks.forEach((task: any) => {
      const date = normalizeDate(task.createdAt);
      if (!date) return;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return Object.entries(monthMap)
      .sort(([a], [b]) => {
        const [yA, mA] = a.split("-").map(Number);
        const [yB, mB] = b.split("-").map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      })
      .map(([key, count]) => ({
        month: monthNames[Number(key.split("-")[1])],
        count,
      }));
  }, [filteredTasks]);

  const tooltipStyle = {
    contentStyle: {
      borderRadius: "10px",
      border: "none",
      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      fontSize: "13px",
    },
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <Box sx={{ width: "100%" }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "black", letterSpacing: "-0.5px" }}>
          Reports & Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Insights and trends across compliance tasks and regulations.
        </Typography>
      </Box>

      {/* Status Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 5 }}>
        {Object.entries(statusSummary).map(([status, count]) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={status}>
            <StatCard status={status} count={count} />
          </Grid>
        ))}
      </Grid>

      {/* Regulation Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: "2px", background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "black" }}>
            Tasks by Regulation
          </Typography>
          {selectedRegulation && (
            <Chip
              icon={<FilterAltOutlinedIcon fontSize="small" />}
              label="Filter Active"
              onDelete={() => setSelectedRegulation(null)}
              color="primary"
              size="small"
              variant="outlined"
              sx={{ borderRadius: "8px", fontWeight: 500, ml: 1 }}
            />
          )}
        </Box>

        <Typography variant="body2" sx={{ color: "#94a3b8", mb: 2.5, fontSize: "0.82rem" }}>
          Click a regulation card to filter charts by that regulation.
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 2.5 }}>
          {regulations.map((reg: any) => {
            const count = roleTasks.filter((t: any) => t.regulationId === reg.id).length;
            const isSelected = selectedRegulation === reg.id;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={reg.id}>
                <Card
                  onClick={() => setSelectedRegulation(isSelected ? null : reg.id)}
                  elevation={0}
                  sx={{
                    borderRadius: "14px",
                    cursor: "pointer",
                    border: isSelected
                      ? "2px solid #6366f1"
                      : "1px solid rgba(0,0,0,0.07)",
                    boxShadow: isSelected
                      ? "0 4px 20px rgba(99,102,241,0.2)"
                      : "0 2px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.18s ease",
                    bgcolor: isSelected ? alpha("#6366f1", 0.03) : "#fff",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <GavelIcon fontSize="small" sx={{ color: isSelected ? "#6366f1" : "#94a3b8", mt: "2px", flexShrink: 0 }} />
                        <Typography fontWeight={700} sx={{ color: "black", fontSize: "0.9rem", lineHeight: 1.3 }}>
                          {reg.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        Code: <strong style={{ color: "#475569" }}>{reg.code}</strong>
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip
                          label={`${count} Tasks`}
                          size="small"
                          sx={{
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: alpha("#6366f1", 0.1),
                            color: "#6366f1",
                          }}
                        />
                        <Chip
                          label={reg.status}
                          size="small"
                          color={reg.status === "Active" ? "success" : "default"}
                          sx={{ borderRadius: "6px", fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 4, height: 22, borderRadius: "2px", background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />
        <Typography variant="h6" fontWeight={700} sx={{ color: "black" }}>
          Visual Analytics
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* LINE CHART */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "14px",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              bgcolor: "background.paper",
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2.5 }}>
              Tasks Created (Monthly)
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReTooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* PIE CHART */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "14px",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              bgcolor: "background.paper",
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2.5 }}>
              Task Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  paddingAngle={4}
                  stroke="none"
                  style={{ outline: "none", cursor: "pointer" }}
                  isAnimationActive
                  onClick={(data) => handlePieClick(data)}
                  activeShape={{ stroke: "#fff", strokeWidth: 3 } as any}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: "#64748b" }}
                />
                <ReTooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}