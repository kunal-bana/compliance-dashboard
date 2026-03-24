import type { Task } from "../features/tasks/tasksApi";

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;

  const due = task.dueDate.toDate();
  const today = new Date();

  return task.status !== "Completed" && due < today;
}

export function getTaskDisplayStatus(task: Task): string {
  if (isTaskOverdue(task)) return "Overdue";
  return task.status;
}