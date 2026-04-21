import type { Task } from "../types/task";

export const isTaskOverdue = (task: any) => {
  if (!task?.dueDate) return false;

  const due = new Date(task.dueDate);
  const today = new Date();

  return due < today && task.status !== "Completed";
};

export const getTaskDisplayStatus = (task: any) => {
  if (!task) return "Pending";

  if (isTaskOverdue(task)) return "Overdue";

  return task.status || "Pending";
};