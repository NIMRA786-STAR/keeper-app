// File: redux/features/auth/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:5000/api/auth",  // Fixed URL
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (newUser) => ({
        url: "/register",
        method: "POST",
        body: newUser,
      }),
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const { 
  useRegisterUserMutation, 
  useLoginUserMutation, 
  useLogoutUserMutation, 
  useGetCurrentUserQuery 
} = authApi;
export default authApi;