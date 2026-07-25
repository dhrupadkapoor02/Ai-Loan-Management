import axios from "axios";

/**
 * Shared Axios instance.
 *
 * `withCredentials: true` is required from Module 2 onward so the
 * HttpOnly refresh-token cookie set by the server is sent automatically on
 * every request — do not remove it even though it's unused by the plain
 * health check in Module 1.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
