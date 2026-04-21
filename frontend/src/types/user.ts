export interface User {
  id: string; // NOT uid
  email: string;
  role: "ADMIN" | "MANAGER" | "VIEWER";
  status?: string;
}