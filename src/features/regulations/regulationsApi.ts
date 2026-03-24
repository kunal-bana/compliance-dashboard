import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Regulation, CreateRegulationInput } from "../../types/regulation";

export const regulationsApi = createApi({
  reducerPath: "regulationsApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Regulations"],

  endpoints: (builder) => ({
    // GET
    getRegulations: builder.query<Regulation[], void>({
      async queryFn() {
        try {
          const q = query(
            collection(db, "regulations"),
            orderBy("createdAt", "desc")
          );

          const snap = await getDocs(q);

          const data: Regulation[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Regulation, "id">),
          }));

          return { data };
        } catch (error) {
          return { error };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Regulations" as const, id })),
              { type: "Regulations", id: "LIST" },
            ]
          : [{ type: "Regulations", id: "LIST" }],
    }),

    // ADD
    addRegulation: builder.mutation<void, CreateRegulationInput>({
      async queryFn(data) {
        try {
          await addDoc(collection(db, "regulations"), {
            ...data,
            createdAt: serverTimestamp(),
          });
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: [{ type: "Regulations", id: "LIST" }],
    }),

    // UPDATE
    updateRegulation: builder.mutation<
      void,
      { id: string; data: Partial<Regulation> }
    >({
      async queryFn({ id, data }) {
        try {
          await updateDoc(doc(db, "regulations", id), data);
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: [{ type: "Regulations", id: "LIST" }],
    }),

    // DELETE
    deleteRegulation: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteDoc(doc(db, "regulations", id));
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: [{ type: "Regulations", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRegulationsQuery,
  useAddRegulationMutation,
  useUpdateRegulationMutation,
  useDeleteRegulationMutation,
} = regulationsApi;