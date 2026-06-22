import { env } from "../utils/env.js";

export const ONE_HOUR = 60 * 60 * 1000;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_MONTH = ONE_DAY * 31;

export const getMongoConfig = () => ({
  user: env("MONGODB_USER"),
  password: env("MONGODB_PASSWORD"),
  url: env("MONGODB_URL"),
  db: env("MONGODB_DB"),
});

export const getGoogleOAuthClientId = () => env("GOOGLE_OAUTH_CLIENT_ID", "");
