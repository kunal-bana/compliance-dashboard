import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";

/* ============================
   ENUM TYPES
============================ */
export type TaskStatus = "Pending" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";

/* ============================
   MAIN TASK MODEL (DB)
============================ */
export interface Task {
  id: string;
  title: string;
  description?: string;
  entityId: string;
  regulationId: string;
  assignedTo: string;
  dueDate: Timestamp | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt?: Timestamp;
  createdBy: string;
}

/* ============================
   FORM INPUT TYPE
============================ */
export interface CreateTaskInput {
  title: string;
  description?: string;
  entityId: string;
  regulationId: string;
  assignedTo: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
}

/* ============================
   API
============================ */
export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Tasks"],

  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      async queryFn() {
        try {
          const q = query(
            collection(db, "tasks"),
            orderBy("createdAt", "desc")
          );

          const snapshot = await getDocs(q);

          const data: Task[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Task, "id">),
          }));

          return { data };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["Tasks"],
    }),

    addTask: builder.mutation<void, CreateTaskInput>({
      async queryFn(task) {
        try {
          await addDoc(collection(db, "tasks"), {
            title: task.title,
            description: task.description ?? "",
            entityId: task.entityId,
            regulationId: task.regulationId,
            assignedTo: task.assignedTo,
            status: task.status,
            priority: task.priority,
            createdBy: task.createdBy,
            dueDate: task.dueDate
              ? Timestamp.fromDate(new Date(task.dueDate))
              : null,
            createdAt: serverTimestamp(),
          });
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Tasks"],
    }),

    updateTask: builder.mutation<
      void,
      { id: string; data: Partial<Task> }
    >({
      async queryFn({ id, data }) {
        try {
          const updatedData = {
            ...data,
            dueDate:
              typeof data.dueDate === "string"
                ? Timestamp.fromDate(new Date(data.dueDate))
                : data.dueDate,
          };

          await updateDoc(doc(db, "tasks", id), updatedData);
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Tasks"],
    }),

    deleteTask: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteDoc(doc(db, "tasks", id));
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Tasks"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;