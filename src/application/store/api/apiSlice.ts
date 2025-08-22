/**
 * Base API Slice
 * RTK Query configuration with authentication handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import Config from 'react-native-config';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: Config.API_URL || 'http://localhost:3000/api/v1',
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = (getState() as RootState).auth.token;

    // Set common headers
    headers.set('Content-Type', 'application/json');

    // Add auth token if available
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Add request ID for tracking
    headers.set('X-Request-ID', generateRequestId());

    return headers;
  },
});

// Base query with re-auth logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Handle 401 unauthorized responses
  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
        body: {
          refreshToken: (api.getState() as RootState).auth.refreshToken,
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Store new token
      api.dispatch({
        type: 'auth/setTokens',
        payload: refreshResult.data,
      });

      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'ShoppingList',
    'ShoppingItem',
    'PantryItem',
    'Collaborator',
    'Category',
    'Analytics',
  ],
  endpoints: builder => ({
    // Health check endpoint
    healthCheck: builder.query<{ status: string; timestamp: string }, void>({
      query: () => '/health',
    }),
  }),
});

// Export hooks
export const { useHealthCheckQuery } = apiSlice;
