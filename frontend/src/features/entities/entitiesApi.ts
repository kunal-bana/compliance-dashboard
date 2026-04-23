import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/baseApi";

export const entitiesApi = createApi({
  reducerPath: "entitiesApi",
  baseQuery,
  tagTypes: ["Entities"],

  endpoints: (builder) => ({
    getEntities: builder.query({
      query: () => "/entities",
      transformResponse: (res: any) =>
        (res.data || []).map((e: any) => ({
          ...e,
          id: e._id,
        })),
      providesTags: ["Entities"],
    }),

    addEntity: builder.mutation({
      query: (body) => ({
        url: "/entities",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Entities"],
    }),

    updateEntity: builder.mutation({
      query: ({ id, data }) => ({
        url: `/entities/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Entities"],
    }),

    deleteEntity: builder.mutation({
      query: (id) => ({
        url: `/entities/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Entities"],
    }),
  }),
});

export const {
  useGetEntitiesQuery,
  useAddEntityMutation,
  useUpdateEntityMutation,
  useDeleteEntityMutation,
} = entitiesApi;