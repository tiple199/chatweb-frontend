const defaultApiBaseUrl = "http://192.168.1.103:5000/api";
const defaultServerUrl = "http://192.168.1.103:5000";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || defaultServerUrl;