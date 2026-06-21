import { RequestHandler } from "express";

import * as authServices from "../services/authService.js";

export const registerUserController: RequestHandler = async (req, res, next) => {
  try {
    const { email, password, group } = req.body as {
      email: string;
      password: string;
      group?: string;
    };

    const result = await authServices.registerUserService({
      email,
      password,
      group,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const loginController: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const session = await authServices.loginService({ email, password });

    res.status(200).json({
      userId: session.userId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      tokenType: "Bearer",
    });
  } catch (err) {
    next(err);
  }
};

export const logoutController: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const [bearer, accessToken] = authHeader?.split(" ") ?? [];
    const { refreshToken } = req.body as { refreshToken?: string };

    await authServices.logoutService({
      accessToken: bearer === "Bearer" ? accessToken : undefined,
      refreshToken,
    });

    res.status(200).json({ message: "Logged out successfully!" });
  } catch (err) {
    next(err);
  }
};

export const refreshController: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      res.status(400).json({ message: "Missing refreshToken" });
      return;
    }

    const session = await authServices.refreshService(refreshToken);

    res.status(200).json({
      userId: session.userId,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      tokenType: "Bearer",
    });
  } catch (err) {
    next(err);
  }
};

export const requestResetEmailController: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body as { email: string };
    await authServices.requestResetEmailService(email);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController: RequestHandler = async (req, res, next) => {
  try {
    await authServices.resetPasswordService();
    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    next(err);
  }
};
