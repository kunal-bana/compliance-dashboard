import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/baseApi";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery,
  tagTypes: ["Users"],

  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      transformResponse: (res: any) =>
        (res.data || []).map((u: any) => ({
          ...u,
          id: u._id,
          uid: u._id,
        })),
      providesTags: ["Users"],
    }),

    getProfile: builder.query({
      query: () => "/users/me",
      transformResponse: (res: any) => ({
        ...res.data,
        id: res.data._id,
        uid: res.data._id,
      }),
    }),
    addUser: builder.mutation({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetProfileQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;