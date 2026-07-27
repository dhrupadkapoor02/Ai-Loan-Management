import { createContext, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  apiRegister,
  apiLogin,
  apiLogout,
  apiLogoutAllDevices,
  apiRefreshToken,
  apiGetMe,
  apiUpdateProfile,
  apiChangePassword,
} from "../services/auth.service";
import { setAccessToken, clearAccessToken } from "../services/tokenStore";
import { registerSessionExpiredHandler } from "../services/apiClient";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // isLoading: true only during the initial "try to restore session" check
  // on first load, so protected routes know not to redirect prematurely.
  const [isLoading, setIsLoading] = useState(true);

  const handleSessionExpired = useCallback(() => {
    setUser(null);
    clearAccessToken();
  }, []);

  useEffect(() => {
    registerSessionExpiredHandler(handleSessionExpired);
  }, [handleSessionExpired]);

  // On first load, there's no access token in memory (page refresh wipes
  // it), but a valid HttpOnly refresh cookie might still exist. Try to
  // silently restore the session before rendering protected content.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { accessToken, user: restoredUser } = await apiRefreshToken();
        if (cancelled) return;
        setAccessToken(accessToken);
        setUser(restoredUser);
      } catch {
        if (cancelled) return;
        clearAccessToken();
        setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const { user: newUser } = await apiRegister({ name, email, password });
    return newUser;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { user: loggedInUser, accessToken } = await apiLogin({ email, password });
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const logoutAllDevices = useCallback(async () => {
    try {
      await apiLogoutAllDevices();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const freshUser = await apiGetMe();
    setUser(freshUser);
    return freshUser;
  }, []);

  const updateProfile = useCallback(async ({ name }) => {
    const updatedUser = await apiUpdateProfile({ name });
    setUser(updatedUser);
    toast.success("Profile updated");
    return updatedUser;
  }, []);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    // Changing the password revokes all sessions server-side, so the user
    // must log in again — clear local state immediately to match.
    await apiChangePassword({ currentPassword, newPassword });
    clearAccessToken();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    register,
    login,
    logout,
    logoutAllDevices,
    refreshCurrentUser,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
