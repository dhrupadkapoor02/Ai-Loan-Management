import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Shared Axios instance used by every service call in the app.
 *
 * `withCredentials: true` is required so the HttpOnly refresh-token cookie
 * set by the server is sent automatically on every request.
 */
export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Separate, interceptor-free instance for the refresh call itself — using
// `apiClient` here would recurse into the response interceptor below.
const refreshClient = axios.create({ baseURL, withCredentials: true });

// Attach the current in-memory access token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Optional hook the AuthContext registers so this interceptor can clear
 * user/app state when a session truly can't be refreshed (e.g. after the
 * refresh cookie itself has expired or been revoked).
 */
let onSessionExpired = () => {};
export function registerSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

let refreshPromise = null;

/**
 * On a 401 (and only once per failed request), attempt a silent token
 * refresh using the HttpOnly cookie, then retry the original request with
 * the new access token. Concurrent 401s share a single in-flight refresh
 * call instead of each firing their own.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    if (status !== 401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient.post("/auth/refresh-token").finally(() => {
          refreshPromise = null;
        });
      }
      const { data } = await refreshPromise;
      setAccessToken(data.data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      onSessionExpired();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
