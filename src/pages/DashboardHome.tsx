import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Paper, alpha } from "@mui/material";
import { Grid, Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

import { useGetEntitiesQuery } from "../features/entities/entitiesApi";
import { useGetRegulationsQuery } from "../features/regulations/regulationsApi";
import { useGetTasksQuery } from "../features/tasks/tasksApi";
import { useNavigate } from "react-router-dom";
import BusinessIcon from "@mui/icons-material/Business";
import GavelIcon from "@mui/icons-material/Gavel";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

/* ============================
   DATE NORMALIZER (SAFE)
   Fixes: non-serializable Firestore Timestamp in Redux store
============================ */
function normalizeDate(value: any): Date | null {
  if (!value) return null;
  // Firestore Timestamp
  if (value?.toDate) return value.toDate();
  // ISO / string date
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  // Already a plain Date
  if (value instanceof Date) return value;
  return null;
}

/* ============================
   KPI CARD
============================ */
function KpiCard({
  title,
  value,
  icon,
  gradient,
  accentColor,
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
  onClick?: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        height: "100%",
        borderRadius: "16px",
        p: { xs: 2.5, sm: 3 },
        color: "#fff",
        background: gradient,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        boxShadow: `0 4px 24px ${alpha(accentColor, 0.35)}`,
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.07)",
          pointerEvents: "none",
        },
        ...(onClick && {
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: `0 10px 32px ${alpha(accentColor, 0.5)}`,
          },
          "&:active": { transform: "translateY(-1px)" },
        }),
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography variant="body2" sx={{ opacity: 0.82, fontWeight: 500, mb: 0.5, fontSize: { xs: "0.78rem", sm: "0.85rem" } }}>
          {title}
        </Typography>
        <Typography variant="h3" fontWeight={800} sx={{ lineHeight: 1, fontSize: { xs: "2rem", sm: "2.4rem" } }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          fontSize: { xs: 34, sm: 42 },
          opacity: 0.85,
          display: "flex",
          alignItems: "center",
        }}
      >
        {icon}
      </Box>
    </Box>
  );
}

/* ============================
   SECTION HEADER
============================ */
function SectionHeader({ title }: { title: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
      <Box sx={{ width: 4, height: 22, borderRadius: "2px", background: "linear-gradient(180deg, #3b82f6, #6366f1)" }} />
      <Typography variant="h6" fontWeight={700} sx={{ color: "#1e293b" }}>
        {title}
      </Typography>
    </Box>
  );
}

/* ============================
   DASHBOARD HOME
============================ */
export default function DashboardHome() {
  const role = useSelector((state: RootState) => state.auth.role);
  const currentUserId = useSelector((state: RootState) => state.auth.uid);
  const navigate = useNavigate();
  const { data: entities = [], isLoading: eLoading } = useGetEntitiesQuery();
  const { data: regulations = [], isLoading: rLoading } = useGetRegulationsQuery();
  const { data: tasks = [], isLoading: tLoading } = useGetTasksQuery();

  if (eLoading || rLoading || tLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Typography color="text.secondary">Loading dashboard…</Typography>
      </Box>
    );
  }

  const enrichedTasks = tasks.map((task: any) => {
    const due = normalizeDate(task.dueDate);
    if (task.status !== "Completed" && due && due < new Date()) {
      return { ...task, computedStatus: "Overdue" };
    }
    return { ...task, computedStatus: task.status };
  });

  const goToTasks = (filter: any) => {
    navigate("/dashboard/tasks", { state: filter });
  };

  const handlePieClick = (entry: any) => {
    if (!entry?.name) return;
    if (entry.name === "Overdue") {
      navigate("/dashboard/tasks", { state: { overdue: true } });
    } else {
      navigate("/dashboard/tasks", { state: { status: entry.name } });
    }
  };

  /* ============================
     METRICS
  ============================ */
  const totalEntities = entities.length;
  const activeRegulations = regulations.filter((r: any) => r.status === "Active").length;
  const totalTasks = enrichedTasks.length;
  const overdueTasks = enrichedTasks.filter((t: any) => t.computedStatus === "Overdue").length;
  const activeTasks = enrichedTasks.filter(
    (t: any) => t.computedStatus === "Pending" || t.computedStatus === "In Progress"
  ).length;
  const myTasks = enrichedTasks.filter((t: any) => t.assignedTo === currentUserId);
  const myCompletedTasks = myTasks.filter((t: any) => t.computedStatus === "Completed").length;
  const myOverdueTasks = myTasks.filter((t: any) => t.computedStatus === "Overdue").length;

  /* ============================
     ROLE BASED CARDS
  ============================ */
  let cards: {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient: string;
    accentColor: string;
    onClick?: () => void;
  }[] = [];

  if (role === "ADMIN") {
    cards = [
      {
        title: "Total Entities",
        value: totalEntities,
        icon: <BusinessIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        accentColor: "#764ba2",
        onClick: () => navigate("/dashboard/entities"),
      },
      {
        title: "Active Regulations",
        value: activeRegulations,
        icon: <GavelIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
        accentColor: "#185a9d",
        onClick: () => navigate("/dashboard/regulations"),
      },
      {
        title: "Total Tasks",
        value: totalTasks,
        icon: <AssignmentIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #f7971e 0%, #f6d365 100%)",
        accentColor: "#f7971e",
        onClick: () => goToTasks({}),
      },
      {
        title: "Overdue Tasks",
        value: overdueTasks,
        icon: <WarningAmberIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
        accentColor: "#ff416c",
        onClick: () => goToTasks({ overdue: true }),
      },
    ];
  }

  if (role === "MANAGER") {
    cards = [
      {
        title: "Total Tasks",
        value: totalTasks,
        icon: <PendingActionsIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #f7971e 0%, #f6d365 100%)",
        accentColor: "#f7971e",
        onClick: () => goToTasks({}),
      },
      {
        title: "Team Active Tasks",
        value: activeTasks,
        icon: <AssignmentIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
        accentColor: "#5b86e5",
        onClick: () => goToTasks({ active: true }),
      },
      {
        title: "Overdue Tasks",
        value: overdueTasks,
        icon: <WarningAmberIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
        accentColor: "#dd2476",
        onClick: () => goToTasks({ overdue: true }),
      },
    ];
  }

  if (role === "VIEWER") {
    cards = [
      {
        title: "My Active Tasks",
        value: myTasks.filter((t: any) => {
          if (t.status === "Completed") return false;
          const due = normalizeDate(t.dueDate);
          return !(due && due < new Date());
        }).length,
        icon: <AssignmentIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        accentColor: "#11998e",
        onClick: () => goToTasks({ assignedTo: currentUserId, active: true }),
      },
      {
        title: "My Completed",
        value: myCompletedTasks,
        icon: <CheckCircleOutlineIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
        accentColor: "#56ab2f",
        onClick: () => goToTasks({ assignedTo: currentUserId, status: "Completed" }),
      },
      {
        title: "My Overdue",
        value: myOverdueTasks,
        icon: <WarningAmberIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
        accentColor: "#ee0979",
        onClick: () => goToTasks({ assignedTo: currentUserId, status: "Overdue" }),
      },
    ];
  }

  /* ============================
     LINE CHART DATA
  ============================ */
  const lineChartData = (() => {
    const monthMap: Record<string, number> = {};
    tasks.forEach((t: any) => {
      const date = normalizeDate(t.createdAt);
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
  })();

  /* ============================
     PIE CHART DATA
  ============================ */
  const pieData = [
    { name: "Pending", value: enrichedTasks.filter((t: any) => t.computedStatus === "Pending").length },
    { name: "In Progress", value: enrichedTasks.filter((t: any) => t.computedStatus === "In Progress").length },
    { name: "Completed", value: enrichedTasks.filter((t: any) => t.computedStatus === "Completed").length },
    { name: "Overdue", value: enrichedTasks.filter((t: any) => t.computedStatus === "Overdue").length },
  ];

  const PIE_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"];

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
    <Box>
      {/* Page header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: "black", letterSpacing: "-0.5px", lineHeight: 1 }}>
          Dashboard Overview
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
          Welcome back — here's what's happening today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {cards.map((card, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: role === "ADMIN" ? 3 : 4 }}
            key={index}
          >
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Box sx={{ mt: 5 }}>
        <SectionHeader title="Analytics" />
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* LINE CHART */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <TrendingUpIcon sx={{ color: "#6366f1", fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary" }}>
                  Tasks Created (Monthly)
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineChartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} vertical={false} />
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
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* PIE CHART */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: "16px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 3 }}>
                Task Status Distribution
              </Typography>
              <Box sx={{ position: "relative" }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={3}
                      stroke="none"
                      style={{ outline: "none", cursor: "pointer" }}
                      onClick={(data) => handlePieClick(data)}
                      activeShape={{ stroke: "#fff", strokeWidth: 3 } as any}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index]} />
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
                {/* Center label */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "42%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Typography variant="h4" fontWeight={800} sx={{ color: "black", lineHeight: 1 }}>
                    {tasks.length}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 500 }}>
                    Total
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}