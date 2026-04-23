export type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Overdue";

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High"

export interface Entity {
  _id: string;
  name: string;
  type?: string;
}

export interface Regulation {
  _id: string;
  title: string;
  code?: string;
}

export interface User {
  _id: string;
  email: string;
  role?: string;
}

export interface Task {
  id: string;
  _id?: string;
  title: string;
  description?: string;

  entityId: Entity;
  regulationId: Regulation;
  assignedTo: User;
  createdBy: User;

  status: TaskStatus;
  priority: TaskPriority;

  dueDate?: string;
  createdAt?: string;
}