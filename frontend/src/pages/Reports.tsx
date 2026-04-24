import {
  Box, Typography, Grid, Card, CardContent, Stack, Chip, alpha,
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
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import EmptyState from "../components/EmptyState";
import { useThemeMode } from "../theme/ThemeContext";

const statusConfig: any = {
  Pending: {
    color: "warning", icon: <AssignmentIcon fontSize="small" />,
    chartColor: "#f59e0b", gradient: "linear-gradient(135deg, #f7971e, #ffd200)", accent: "#f7971e",
  },
  "In Progress": {
    color: "info", icon: <AutorenewIcon fontSize="small" />,
    chartColor: "#3b82f6", gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)", accent: "#3b82f6",
  },
  Completed: {
    color: "success", icon: <CheckCircleIcon fontSize="small" />,
    chartColor: "#10b981", gradient: "linear-gradient(135deg, #56ab2f, #a8e063)", accent: "#10b981",
  },
  Overdue: {
    color: "error", icon: <WarningAmberIcon fontSize="small" />,
    chartColor: "#ef4444", gradient: "linear-gradient(135deg, #ff416c, #ff4b2b)", accent: "#ef4444",
  },
};

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

function StatCard({ status, count }: { status: string; count: number }) {
  const config = statusConfig[status];
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  return (
    <Card elevation={0} sx={{
      borderRadius: "16px",
      border: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
      boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.25)" : "0 2px 16px rgba(0,0,0,0.05)",
      overflow: "hidden", position: "relative", bgcolor: "background.paper",
    }}>
      <Box sx={{
        position: "absolute", top: 0, left: 0,
        width: "3.5px", height: "100%", background: config.gradient,
      }} />
      <CardContent sx={{ pl: 3, py: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, mb: 0.5, fontSize: "0.8rem" }}>
              {status}
            </Typography>
            <Typography fontWeight={800} sx={{
              color: "text.primary", lineHeight: 1,
              fontSize: "2.2rem", fontFamily: "'DM Sans', sans-serif",
            }}>
              {count}
            </Typography>
          </Box>
          <Box sx={{
            width: 42, height: 42, borderRadius: "12px",
            background: alpha(config.accent, isDark ? 0.18 : 0.1),
            display: "flex", alignItems: "center", justifyContent: "center",
            color: config.accent,
          }}>
            {config.icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  const role = useSelector((state: RootState) => state.auth.role);
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const { data: tasks = [] } = useGetTasksQuery(undefined);
  const { data: regulations = [] } = useGetRegulationsQuery(undefined);
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);

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
    if (entry.name === "Overdue") navigate("/dashboard/tasks", { state: { overdue: true } });
    else navigate("/dashboard/tasks", { state: { status: entry.name } });
  };

  const roleTasks = role === "VIEWER"
    ? enrichedTasks.filter((t: any) => t.assignedTo === currentUserId)
    : enrichedTasks;

  const filteredTasks = selectedRegulation
    ? roleTasks.filter(
      (t: any) =>
        String(t.regulationId?._id) === String(selectedRegulation)
    )
    : roleTasks;

  const statusSummary = {
    Pending: filteredTasks.filter((t: any) => t.computedStatus === "Pending").length,
    "In Progress": filteredTasks.filter((t: any) => t.computedStatus === "In Progress").length,
    Completed: filteredTasks.filter((t: any) => t.computedStatus === "Completed").length,
    Overdue: filteredTasks.filter((t: any) => t.computedStatus === "Overdue").length,
  };

  const pieData = Object.entries(statusSummary)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: statusConfig[status].chartColor,
    }))
    .filter((item) => item.value > 0);

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
      .map(([key, count]) => ({ month: monthNames[Number(key.split("-")[1])], count }));
  }, [filteredTasks]);

  const tooltipStyle = {
    contentStyle: {
      borderRadius: "12px", border: "none",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontSize: "12.5px",
      backgroundColor: isDark ? "#1e293b" : "#fff",
      color: isDark ? "#f1f5f9" : "#0f172a",
    },
  };

  const chartCardSx = {
    elevation: 0,
    sx: {
      borderRadius: "16px",
      border: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
      boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
      bgcolor: "background.paper", p: { xs: 2.5, sm: 3 },
    },
  };

  const SectionHeader = ({ title, filterActive }: { title: string; filterActive?: boolean }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
      <Box sx={{ width: 3.5, height: 20, borderRadius: "2px", background: "linear-gradient(180deg, #6366f1, #3b82f6)" }} />
      <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", fontSize: "1rem" }}>
        {title}
      </Typography>
      {filterActive && (
        <Chip icon={<FilterAltOutlinedIcon fontSize="small" />} label="Filter Active"
          onDelete={() => setSelectedRegulation(null)} color="primary" size="small" variant="outlined"
          sx={{ borderRadius: "8px", fontWeight: 500, ml: 0.5 }} />
      )}
    </Box>
  );
  if (!tasks.length) {
    return (
      <EmptyState
        title="No Reports Yet"
        subtitle="Reports will appear after tasks are created"
      />
    );
  }
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} sx={{
          color: "text.primary", letterSpacing: "-0.6px",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          Reports & Analytics
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
          Insights and trends across compliance tasks and regulations.
        </Typography>
      </Box>

      {/* Status Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: 5 }}>
        {Object.entries(statusSummary).map(([status, count]) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={status}>
            <StatCard status={status} count={count} />
          </Grid>
        ))}
      </Grid>

      {/* Regulation Filter Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader title="Tasks by Regulation" filterActive={!!selectedRegulation} />
        <Typography variant="body2" sx={{ color: "text.disabled", mb: 2.5, fontSize: "0.8rem" }}>
          Click a regulation card to filter charts by that regulation.
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 2 }}>
          {regulations.map((reg: any) => {
            const count = roleTasks.filter(
              (t: any) => String(t.regulationId?._id) === String(reg.id)
            ).length;
            const isSelected = selectedRegulation === reg.id;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={reg.id}>
                <Card onClick={() => setSelectedRegulation(isSelected ? null : reg.id)}
                  elevation={0} sx={{
                    borderRadius: "14px", cursor: "pointer",
                    border: isSelected ? "2px solid #6366f1" : "1px solid",
                    borderColor: isSelected ? "#6366f1" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
                    boxShadow: isSelected
                      ? "0 4px 20px rgba(99,102,241,0.22)"
                      : isDark ? "0 2px 12px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.04)",
                    transition: "all 0.18s ease",
                    bgcolor: isSelected ? alpha("#6366f1", isDark ? 0.08 : 0.03) : "background.paper",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: isDark ? "0 8px 28px rgba(0,0,0,0.35)" : "0 6px 24px rgba(0,0,0,0.1)",
                    },
                  }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <GavelIcon fontSize="small" sx={{
                          color: isSelected ? "#6366f1" : "text.disabled",
                          mt: "2px", flexShrink: 0, transition: "color 0.15s ease",
                        }} />
                        <Typography fontWeight={700} sx={{ color: "text.primary", fontSize: "0.875rem", lineHeight: 1.35 }}>
                          {reg.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: "text.disabled", fontSize: "0.78rem" }}>
                        Code: <strong style={{ color: isDark ? "#94a3b8" : "#475569" }}>{reg.code}</strong>
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Chip label={`${count} Tasks`} size="small" sx={{
                          borderRadius: "6px", fontWeight: 600, fontSize: "0.72rem",
                          bgcolor: alpha("#6366f1", isDark ? 0.18 : 0.1), color: "#6366f1",
                        }} />
                        <Chip label={reg.status} size="small"
                          color={reg.status === "Active" ? "success" : "default"}
                          sx={{ borderRadius: "6px", fontWeight: 600, fontSize: "0.72rem" }} />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Charts */}
      <SectionHeader title="Visual Analytics" />
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card {...chartCardSx}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2.5, fontSize: "0.925rem" }}>
              Tasks Created (Monthly)
            </Typography>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={lineData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}
                  strokeOpacity={isDark ? 0.1 : 0.15}
                  stroke={isDark ? "#fff" : "#000"} />
                <XAxis dataKey="month"
                  tick={{ fontSize: 11.5, fill: isDark ? "#64748b" : "#94a3b8" }}
                  axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false}
                  tick={{ fontSize: 11.5, fill: isDark ? "#64748b" : "#94a3b8" }}
                  axisLine={false} tickLine={false} />
                <ReTooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: isDark ? "#111827" : "#fff" }}
                  activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: isDark ? "#111827" : "#fff" }}
                  isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card {...chartCardSx}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 2.5, fontSize: "0.925rem" }}>
              Task Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                  style={{ outline: "none", cursor: "pointer" }} isAnimationActive
                  onClick={(data) => handlePieClick(data)}
                  activeShape={{ stroke: isDark ? "#111827" : "#fff", strokeWidth: 3 } as any}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" iconSize={7}
                  wrapperStyle={{ fontSize: 11.5, color: isDark ? "#64748b" : "#64748b" }} />
                <ReTooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}