export type TaskStatus = "Pending" | "In Progress" | "Completed";

export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  entityId: string;
  regulationId: string;
  assignedTo: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdBy: string;
  createdAt?: string;
}