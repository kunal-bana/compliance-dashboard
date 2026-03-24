import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

export interface User {
  uid: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "VIEWER";
  status: "Active" | "Inactive";
  createdAt?: any;
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Users"],

  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      async queryFn() {
        try {
          const snapshot = await getDocs(collection(db, "users"));

          const data: User[] = snapshot.docs.map((docSnap) => ({
            uid: docSnap.id, 
            ...(docSnap.data() as Omit<User, "uid">),
          }));

          return { data };
        } catch (error) {
          return { error: error as any };
        }
      },
      providesTags: ["Users"],
    }),

    updateUser: builder.mutation<
      void,
      { uid: string; data: Partial<User> }
    >({
      async queryFn({ uid, data }) {
        try {
          await updateDoc(doc(db, "users", uid), data);
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation<void, string>({
      async queryFn(uid) {
        try {
          await deleteDoc(doc(db, "users", uid));
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;