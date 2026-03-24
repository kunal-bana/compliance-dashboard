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
import { Paper } from "@mui/material";
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

/* ============================
   DATE NORMALIZER (SAFE)
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
  onClick,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  onClick?: () => void;
}) {
  return (
    <Box
    onClick={onClick}
      sx={{
        height: "100%",
        borderRadius: 2,
        p: 3,
        color: "#fff",
        background: gradient,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "2",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.1s ease, box-shadow 0.1s ease",
        "&:hover":onClick ? {
          transform: "translateY(-2px)",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.25)",
        } : { },
      }}
    >
      <Box>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
      </Box>

      <Box sx={{ fontSize: 42, opacity: 0.9 }}>{icon}</Box>
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
  const { data: regulations = [], isLoading: rLoading } =
    useGetRegulationsQuery();
  const { data: tasks = [], isLoading: tLoading } = useGetTasksQuery();

  if (eLoading || rLoading || tLoading) {
    return <Typography>Loading dashboard…</Typography>;
  }
   const enrichedTasks = tasks.map((task: any) => {
    const due = normalizeDate(task.dueDate);

    if (
      task.status !== "Completed" &&
      due &&
      due < new Date()
    ) {
      return { ...task, computedStatus: "Overdue" };
    }

    return { ...task, computedStatus: task.status };
  });

  const goToTasks = (filter: any) => {
  navigate("/dashboard/tasks", {
    state: filter,
  });
};
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
     METRICS
  ============================ */
  const totalEntities = entities.length;

  const activeRegulations = regulations.filter(
    (r: any) => r.status === "Active"
  ).length;

  const totalTasks = enrichedTasks.length;

  const overdueTasks = enrichedTasks.filter(
    (t: any) => t.computedStatus === "Overdue"
  ).length;

  const activeTasks = enrichedTasks.filter(
    (t: any) =>
      t.computedStatus === "Pending" ||
      t.computedStatus === "In Progress"
  ).length;

  const myTasks = enrichedTasks.filter(
    (t: any) => t.assignedTo === currentUserId
  );

  const myCompletedTasks = myTasks.filter(
    (t: any) => t.computedStatus === "Completed"
  ).length;

  const myOverdueTasks = myTasks.filter(
    (t: any) => t.computedStatus === "Overdue"
  ).length;

  /* ============================
     ROLE BASED CARDS
  ============================ */
  let cards: {
    title: string;
    value: number;
    icon: React.ReactNode;
    gradient: string;
    onClick?: () => void;
  }[] = [];

  /* -------- ADMIN -------- */
  if (role === "ADMIN") {
    cards = [
      {
        title: "Total Entities",
        value: totalEntities,
        icon: <BusinessIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #667eea, #764ba2)",
        onClick: () => navigate("/dashboard/entities"),
      },
      {
        title: "Active Regulations",
        value: activeRegulations,
        icon: <GavelIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #43cea2, #185a9d)",
        onClick: () => navigate("/dashboard/regulations"),
      },
      {
        title: "Total Tasks",
        value: totalTasks,
        icon: <AssignmentIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #f7971e, #ffd200)",
        onClick: () => goToTasks({}),
      },
      {
        title: "Overdue Tasks",
        value: overdueTasks,
        icon: <WarningAmberIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #ff416c, #ff4b2b)",
        onClick: () => goToTasks({overdue: true }),
      },
    ];
  }

  /* -------- MANAGER -------- */
  if (role === "MANAGER") {
    cards = [
      {
        title: "Total Tasks",
        value: totalTasks,
        icon: <PendingActionsIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #f7971e, #ffd200)",
        onClick: () => goToTasks({}),
      },
      {
        title: "Team Active Tasks",
        value: activeTasks,
        icon: <AssignmentIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
        onClick: () => goToTasks({ active: true }),
      },
      {
        title: "Overdue Tasks",
        value: overdueTasks,
        icon: <WarningAmberIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #ff512f, #dd2476)",
        onClick: () => goToTasks({ overdue: true }),
      },
    ];
  }

  /* -------- VIEWER -------- */
  if (role === "VIEWER") {
    cards = [
      {
        title: "My Active Tasks",
        value: myTasks.filter((t: any) => {
          if (t.status === "Completed") return false;
          const due = normalizeDate(t.dueDate);
          const isOverdue = due ? due < new Date() : false;
          return !isOverdue;
        }).length,
        icon: <AssignmentIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
        onClick: () => goToTasks({ assignedTo: currentUserId, active: true }),
      },
      {
        title: "My Completed",
        value: myCompletedTasks,
        icon: <CheckCircleOutlineIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #56ab2f, #a8e063)",
        onClick: () =>
          goToTasks({ assignedTo: currentUserId, status: "Completed" }),
      },
      {
        title: "My Overdue",
        value: myOverdueTasks,
        icon: <WarningAmberIcon fontSize="inherit" />,
        gradient: "linear-gradient(135deg, #ee0979, #ff6a00)",
        onClick: () =>
          goToTasks({ assignedTo: currentUserId, status: "Overdue" }),
      },
    ];
  }
  /* ============================
     RENDER
  ============================ */
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid size={{
            xs: 12,
            sm: 6,
            md: role === "ADMIN" ? 3 : 4}} 
            key={index}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 6 }}>
        <Grid container spacing={4}>
    {/* ================= LINE CHART ================= */}
        <Grid size={{ xs: 12, md: 8}}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Tasks Created (Monthly)
            </Typography>
          <ResponsiveContainer height={300}>
          <LineChart
            data={(() => {
              const monthMap: Record<string, number> = {};
              tasks.forEach((t: any) => {
                const date = normalizeDate(t.createdAt);
                if (!date) return;
                const year = date.getFullYear();
                const monthIndex = date.getMonth();
                const key = `${year}-${monthIndex}`;
                monthMap[key] = (monthMap[key] || 0) + 1;
              });
              const sortedEntries = Object.entries(monthMap).sort(
                ([a], [b]) => {
                  const [yearA, monthA] = a.split("-").map(Number);
                  const [yearB, monthB] = b.split("-").map(Number);
                  if (yearA !== yearB) return yearA - yearB;
                  return monthA - monthB;
                }
              );
              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              return sortedEntries.map(([key, count]) => {
                const [, monthIndex] = key.split("-").map(Number);
                return {
                  month: monthNames[monthIndex],
                  count,
                };
              });
              })()}>
                  <defs>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#667eea" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                dataKey="month"
                tick={{ fontSize: 13 }}
                axisLine={false}
                tickLine={false}
                />
                <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}/>
                <ReTooltip
                contentStyle={{
                  borderRadius: 6,
                  border: "none",
                  boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",}}/>
                  <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#667eea"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  fill="url(#colorTasks)"
                />
          </LineChart>
          </ResponsiveContainer>
          </Paper>
       </Grid>

    {/* ================= PIE CHART ================= */}
       <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Task Status Distribution
          </Typography>
        <Box sx={{ position: "relative"}}>
        <ResponsiveContainer height={300}>
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
                <stop offset="0%" stopColor="#43cea2" />
                <stop offset="100%" stopColor="#185a9d" />
              </linearGradient>
              <linearGradient id="gradOverdue" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff416c" />
                <stop offset="100%" stopColor="#ff4b2b" />
              </linearGradient>
            </defs>
            <Pie
            data={[
              { name: "Pending", value: enrichedTasks.filter((t:any)=>t.computedStatus==="Pending").length },
              { name: "In Progress", value: enrichedTasks.filter((t:any)=>t.computedStatus==="In Progress").length },
              { name: "Completed", value: enrichedTasks.filter((t:any)=>t.computedStatus==="Completed").length },
              { name: "Overdue", value: enrichedTasks.filter((t:any)=>t.computedStatus==="Overdue").length },]}
              dataKey="value"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              stroke="none"
              style={{ outline: "none",cursor: "pointer" }}
              isAnimationActive
              onClick={(data) => handlePieClick(data)}
              activeShape={{ stroke: "#fff", strokeWidth: 2 }}>
                <Cell fill="url(#gradPending)" />
                <Cell fill="url(#gradProgress)" />
                <Cell fill="url(#gradCompleted)" />
                <Cell fill="url(#gradOverdue)" />
              </Pie>
              <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 14 }}/>
              <ReTooltip
              contentStyle={{
              borderRadius: 6,
              border: "none",
              boxShadow: "0px 8px 20px rgba(0,0,0,0.15)",
            }}
            />
          </PieChart> 
          <Typography
          sx={{
            position: "absolute",
            textAlign: "center",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontWeight: 700,
            fontSize: 22,
          }}>
            {tasks.length}
          <Typography variant="caption" display="block">
            Total Tasks
          </Typography>
        </Typography>
       </ResponsiveContainer>
        </Box>
      </Paper>
    </Grid>
  </Grid>
</Box>
    </Box>
  );
}