import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/baseApi";

export const regulationsApi = createApi({
  reducerPath: "regulationsApi",
  baseQuery,
  tagTypes: ["Regulations"],

  endpoints: (builder) => ({
    getRegulations: builder.query({
      query: () => "/regulations",
      transformResponse: (res: any[]) =>
        res.map((r) => ({
          ...r,
          id: r._id,
        })),
      providesTags: ["Regulations"],
    }),

    addRegulation: builder.mutation({
      query: (body) => ({
        url: "/regulations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Regulations"],
    }),

    updateRegulation: builder.mutation({
      query: ({ id, data }) => ({
        url: `/regulations/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Regulations"],
    }),

    deleteRegulation: builder.mutation({
      query: (id) => ({
        url: `/regulations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Regulations"],
    }),
  }),
});

export const {
  useGetRegulationsQuery,
  useAddRegulationMutation,
  useUpdateRegulationMutation,
  useDeleteRegulationMutation,
} = regulationsApi;