// API configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3001'
  : '';  // Empty string means same domain (Vercel will handle routing)

export default API_BASE_URL;
