import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Environment-based API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://gold-pawn-broker.vercel.app/api'
    : 'http://localhost:3000/api'
);

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Particular', 'Transaction'],
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
} = api;
