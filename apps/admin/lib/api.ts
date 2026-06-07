export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';
export const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
