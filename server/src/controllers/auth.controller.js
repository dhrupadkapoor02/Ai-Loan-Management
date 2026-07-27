import asyncHandler from "express-async-handler";
import * as authService from "../services/auth.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshTokenFromCookies } from "../utils/cookies.js";
import { expiresInToDate } from "../utils/jwt.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

function requestMeta(req) {
  return { userAgent: req.headers["user-agent"], ipAddress: req.ip };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.register({ name, email, password });

  return sendSuccess(res, {
    statusCode: 201,
    message: "Registration successful. Please check your email to verify your account.",
    data: { user },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, rawRefreshToken } = await authService.login({
    email,
    password,
    ...requestMeta(req),
  });

  setRefreshTokenCookie(res, rawRefreshToken, expiresInToDate(env.JWT_REFRESH_EXPIRES_IN));

  return sendSuccess(res, {
    message: "Login successful",
    data: { user, accessToken },
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const rawRefreshToken = getRefreshTokenFromCookies(req);

  const { user, accessToken, rawRefreshToken: newRawRefreshToken } = await authService.refreshTokens({
    rawRefreshToken,
    ...requestMeta(req),
  });

  setRefreshTokenCookie(res, newRawRefreshToken, expiresInToDate(env.JWT_REFRESH_EXPIRES_IN));

  return sendSuccess(res, {
    message: "Token refreshed",
    data: { user, accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const rawRefreshToken = getRefreshTokenFromCookies(req);
  await authService.logout({ rawRefreshToken });
  clearRefreshTokenCookie(res);

  return sendSuccess(res, { message: "Logged out successfully" });
});

export const logoutAllDevices = asyncHandler(async (req, res) => {
  await authService.logoutAllDevices(req.user.id);
  clearRefreshTokenCookie(res);

  return sendSuccess(res, { message: "Logged out of all devices" });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);
  return sendSuccess(res, { message: "Email verified successfully", data: { user } });
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.body.email);
  return sendSuccess(res, {
    message: "If an account with that email exists and is unverified, a new verification link has been sent.",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return sendSuccess(res, {
    message: "If an account with that email exists, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetPassword({
    rawToken: req.params.token,
    newPassword: req.body.password,
  });
  return sendSuccess(res, { message: "Password reset successfully. Please log in again.", data: { user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.changePassword({ userId: req.user.id, currentPassword, newPassword });
  clearRefreshTokenCookie(res);
  return sendSuccess(res, {
    message: "Password changed successfully. Please log in again.",
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (name === undefined) throw ApiError.badRequest("Nothing to update");

  const user = await authService.updateProfile(req.user.id, { name });
  return sendSuccess(res, { message: "Profile updated successfully", data: { user } });
});

export const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: "Current user", data: { user: req.user } });
});
