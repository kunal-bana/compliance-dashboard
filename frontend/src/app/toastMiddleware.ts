import type { Middleware } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

/* MESSAGE MAP USING ENDPOINT NAMES */
const messageMap: Record<string, string> = {
  addEntity: "Entity created successfully",
  updateEntity: "Entity updated successfully",
  deleteEntity: "Entity deleted successfully",

  addRegulation: "Regulation added successfully",
  updateRegulation: "Regulation updated successfully",
  deleteRegulation: "Regulation deleted successfully",

  addTask: "Task created successfully",
  updateTask: "Task updated successfully",
  deleteTask: "Task deleted successfully",

  updateUser: "User updated successfully",
  deleteUser: "User deleted successfully",
};

export const toastMiddleware: Middleware =
  () => (next) => (action: any) => {

    const type = action.type;

    // ONLY MUTATIONS
    if (!type.includes("/executeMutation/")) {
      return next(action);
    }

    // GET ACTUAL ENDPOINT NAME
    const endpoint = action.meta?.arg?.endpointName;

    // SUCCESS
    if (type.endsWith("/fulfilled")) {
      toast.success(
        messageMap[endpoint] || "Action successful"
      );
    }

    // ERROR
    if (type.endsWith("/rejected")) {
      toast.error("Operation failed");
    }

    return next(action);
  };