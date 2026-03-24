import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import type { Entity,CreateEntityInput } from "../../types/entity";

export const entitiesApi = createApi({
  reducerPath: "entitiesApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Entities"],

  endpoints: (builder) => ({
    // GET ENTITIES
    getEntities: builder.query<Entity[], void>({
      async queryFn() {
        try {
          const q = query(
            collection(db, "entities"),
            orderBy("createdAt", "desc")
          );

          const snapshot = await getDocs(q);

          const data: Entity[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Entity, "id">),
          }));

          return { data };
        } catch (error) {
          return { error };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Entities" as const, id })),
              { type: "Entities", id: "LIST" },
            ]
          : [{ type: "Entities", id: "LIST" }],
    }),

    // UPDATE ENTITY
    updateEntity: builder.mutation<
      void,
      { id: string; data: Partial<Entity> }
    >({
      async queryFn({ id, data }) {
        try {
          await updateDoc(doc(db, "entities", id), data);
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },

      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          entitiesApi.util.updateQueryData(
            "getEntities",
            undefined,
            (draft) => {
              const entity = draft.find((e) => e.id === id);
              if (entity) Object.assign(entity, data);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // DELETE ENTITY
    deleteEntity: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          await deleteDoc(doc(db, "entities", id));
          return { data: undefined };
        } catch (error) {
          return { error };
        }
      },

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          entitiesApi.util.updateQueryData(
            "getEntities",
            undefined,
            (draft) => {
              const index = draft.findIndex((e) => e.id === id);
              if (index !== -1) {
                draft.splice(index, 1); // ✅ correct optimistic delete
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // ADD ENTITY
    addEntity: builder.mutation<void, CreateEntityInput>({
  async queryFn(entity) {
    try {
      await addDoc(collection(db, "entities"), {
        ...entity,
        createdAt: serverTimestamp(),
      });
      return { data: undefined };
    } catch (error) {
      return { error };
    }
  },
  invalidatesTags: [{ type: "Entities", id: "LIST" }],
}),
  }),
});

export const {
  useGetEntitiesQuery,
  useAddEntityMutation,
  useUpdateEntityMutation,
  useDeleteEntityMutation,
} = entitiesApi;