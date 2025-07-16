import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Cookies from 'js-cookie';

// Environment-based API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://gold-pawn-broker.vercel.app/api'
    : 'http://localhost:3000/api'
);

// Custom baseQuery with refresh logic
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = Cookies.get('token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshResult = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include', // send cookies
    });
    const data = await refreshResult.json();
    if (data.token) {
      Cookies.set('token', data.token);
      // Retry the original query with the new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      Cookies.remove('token');
      window.location.href = '/login';
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRefresh, // Use the custom baseQuery
  tagTypes: ['Particular', 'Transaction', 'User'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getDashboard: builder.query({
      query: () => '/dashboard/overview',
    }),
    getParticulars: builder.query({
      query: ({ search = '', page = 1 }) => `/particulars?search=${search}&page=${page}`,
      providesTags: ['Particular'],
    }),
    getParticular: builder.query({
      query: (id) => `/particulars/${id}`,
      providesTags: ['Particular'],
    }),
    createParticular: builder.mutation({
      query: (data) => ({
        url: '/particulars',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Particular'],
    }),
    updateParticular: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/particulars/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Particular'],
    }),
    deleteParticular: builder.mutation({
      query: (id) => ({
        url: `/particulars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Particular'],
    }),
    getTransaction: builder.query({
      query: (id) => `/transactions/${id}`,
      providesTags: ['Transaction'],
    }),
    getTransactions: builder.query({
      query: (id) => `/transactions/particular/${id}`,
      providesTags: ['Transaction'],
    }),
    createTransaction: builder.mutation({
      query: (data) => ({
        url: '/transactions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transaction'],
    }),
    updateTransaction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Transaction'],
    }),
    deleteTransaction: builder.mutation({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transaction'],
    }),
    // User profile management
    getUserProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    updateUserProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: data,
      }),
    }),
    // Transaction search
    searchTransactions: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        return `/transactions/search?${searchParams.toString()}`;
      },
      providesTags: ['Transaction'],
    }),
    test401: builder.mutation({
      query: () => ({
        url: '/test-401',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetDashboardQuery,
  useGetParticularsQuery,
  useGetParticularQuery,
  useCreateParticularMutation,
  useUpdateParticularMutation,
  useDeleteParticularMutation,
  useGetTransactionQuery,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useSearchTransactionsQuery,
  useTest401Mutation,
} = api;
