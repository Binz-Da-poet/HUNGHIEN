export const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:3001/api'
    : process.env.NEXT_PUBLIC_API_URL ?? '/api';
