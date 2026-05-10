import createHttpError from "http-errors";
import type { RequestHandler } from "express";

import { getUserByAccessToken } from "../services/authService.js";

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return next(createHttpError(401, "Please provide Authorization header"));
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      return next(createHttpError(401, "Auth header should be of type Bearer"));
    }

    const user = await getUserByAccessToken(token);

    req.user = user;
    req.typeAccount = null;

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return next(createHttpError(401, "Invalid token"));
  }
};
