export type Role = "ADMIN" | "MANAGER" | "VIEWER";

export const PERMISSIONS = {
  ENTITY: {
    CREATE: ["ADMIN", "MANAGER"],
    UPDATE: ["ADMIN", "MANAGER"],
    DELETE: ["ADMIN"],
  },
  REGULATION: {
    CREATE: ["ADMIN", "MANAGER"],
    UPDATE: ["ADMIN", "MANAGER"],
    DELETE: ["ADMIN"],
  },
  TASK: {
    CREATE: ["ADMIN", "MANAGER"],
    UPDATE: ["ADMIN", "MANAGER"],
    DELETE: ["ADMIN"],
  },
} as const;