import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "api",
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery: baseQuery,
  endpoints: () => ({}), // Endpoints are injected in features
  tagTypes: [
  ],
});