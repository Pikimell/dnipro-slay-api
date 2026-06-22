import crypto from "node:crypto";
import { promisify } from "node:util";

import createHttpError from "http-errors";

import { getGoogleOAuthClientId, ONE_HOUR, ONE_MONTH } from "../helpers/constants.js";
import { SessionCollection } from "../database/models/session.js";
import { createUser, getUserByEmail, getUserById } from "./userService.js";

const scryptAsync = promisify(crypto.scrypt);
const PASSWORD_KEY_LENGTH = 64;

export type AuthSession = {
  userId: string;
  accessToken: string;
  refreshToken: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  group?: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type GoogleLoginPayload = {
  idToken: string;
};

type LogoutPayload = {
  accessToken?: string;
  refreshToken?: string;
};

type GoogleTokenInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
};

const normalizeEmail = (email: string) => email.toLowerCase().trim();

const generateToken = () => crypto.randomBytes(48).toString("base64url");

const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const hashPassword = async (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
};

const verifyPassword = async (password: string, passwordHash: string) => {
  const [salt, storedKey] = passwordHash.split(":");

  if (!salt || !storedKey) {
    return password === passwordHash;
  }

  const derivedKey = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;
  const storedBuffer = Buffer.from(storedKey, "hex");

  return (
    storedBuffer.length === derivedKey.length &&
    crypto.timingSafeEqual(storedBuffer, derivedKey)
  );
};

const createSession = async (userId: string): Promise<AuthSession> => {
  const accessToken = generateToken();
  const refreshToken = generateToken();
  const now = Date.now();

  await SessionCollection.create({
    userId,
    accessTokenHash: hashToken(accessToken),
    refreshTokenHash: hashToken(refreshToken),
    accessTokenValidUntil: new Date(now + ONE_HOUR),
    refreshTokenValidUntil: new Date(now + ONE_MONTH),
  });

  return {
    userId,
    accessToken,
    refreshToken,
  };
};

export const registerUserService = async ({
  email,
  password,
  group: _group,
}: RegisterPayload) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw createHttpError(409, "User with this email already exists");
  }

  const user = await createUser({
    email: normalizedEmail,
    nickname: normalizedEmail,
    password: await hashPassword(password),
  });

  return {
    message: "User registered successfully",
    userId: user._id.toString(),
  };
};

export const loginService = async ({ email, password }: LoginPayload): Promise<AuthSession> => {
  const normalizedEmail = normalizeEmail(email);
  const user = await getUserByEmail(normalizedEmail);

  if (!user || !(await verifyPassword(password, user.password))) {
    throw createHttpError(401, "Invalid email or password");
  }

  if (!user.password.includes(":")) {
    user.password = await hashPassword(password);
  }

  if (!user.email) {
    user.email = normalizedEmail;
  }

  if (user.isModified("password") || user.isModified("email")) {
    await user.save();
  }

  return createSession(user._id.toString());
};

const verifyGoogleIDToken = async (idToken: string) => {
  if (!idToken) {
    throw createHttpError(400, "Missing Google ID token");
  }

  const expectedAudience = getGoogleOAuthClientId();
  if (!expectedAudience) {
    throw createHttpError(503, "Google sign-in is not configured");
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );

  if (!response.ok) {
    throw createHttpError(401, "Invalid Google ID token");
  }

  const tokenInfo = (await response.json()) as GoogleTokenInfo;

  if (tokenInfo.aud !== expectedAudience) {
    throw createHttpError(401, "Google ID token audience does not match this app");
  }

  if (String(tokenInfo.email_verified) !== "true" || !tokenInfo.email) {
    throw createHttpError(401, "Google email is not verified");
  }

  return {
    email: normalizeEmail(tokenInfo.email),
    subject: tokenInfo.sub,
  };
};

export const loginWithGoogleService = async ({
  idToken,
}: GoogleLoginPayload): Promise<AuthSession> => {
  const googleUser = await verifyGoogleIDToken(idToken);
  let user = await getUserByEmail(googleUser.email);

  if (!user) {
    user = await createUser({
      email: googleUser.email,
      nickname: googleUser.email,
      password: await hashPassword(generateToken()),
    });
  }

  return createSession(user._id.toString());
};

export const logoutService = async ({ accessToken, refreshToken }: LogoutPayload) => {
  const tokenFilters = [];

  if (accessToken) {
    tokenFilters.push({ accessTokenHash: hashToken(accessToken) });
  }

  if (refreshToken) {
    tokenFilters.push({ refreshTokenHash: hashToken(refreshToken) });
  }

  if (tokenFilters.length === 0) {
    return { message: "User already logged out" };
  }

  await SessionCollection.deleteMany({ $or: tokenFilters });

  return { message: "Logged out successfully" };
};

export const refreshService = async (refreshToken: string): Promise<AuthSession> => {
  const refreshTokenHash = hashToken(refreshToken);
  const session = await SessionCollection.findOne({ refreshTokenHash });

  if (!session || session.refreshTokenValidUntil.getTime() <= Date.now()) {
    throw createHttpError(401, "Invalid refresh token");
  }

  const accessToken = generateToken();
  const nextRefreshToken = generateToken();
  const now = Date.now();

  session.accessTokenHash = hashToken(accessToken);
  session.refreshTokenHash = hashToken(nextRefreshToken);
  session.accessTokenValidUntil = new Date(now + ONE_HOUR);
  session.refreshTokenValidUntil = new Date(now + ONE_MONTH);

  await session.save();

  return {
    userId: session.userId.toString(),
    accessToken,
    refreshToken: nextRefreshToken,
  };
};

export const requestResetEmailService = async (_email: string) => {
  throw createHttpError(501, "Password reset email is not configured");
};

export const resetPasswordService = async () => {
  throw createHttpError(501, "Password reset is not configured");
};

export const disableUserService = async (_email: string) => {
  throw createHttpError(501, "User disabling is not configured");
};

export const enableUserService = async (_email: string) => {
  throw createHttpError(501, "User enabling is not configured");
};

export const getUserByAccessToken = async (accessToken: string) => {
  const session = await SessionCollection.findOne({
    accessTokenHash: hashToken(accessToken),
  });

  if (!session || session.accessTokenValidUntil.getTime() <= Date.now()) {
    throw createHttpError(401, "Invalid token");
  }

  return getUserById(session.userId.toString());
};
