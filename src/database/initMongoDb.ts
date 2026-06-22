import type { RequestHandler } from "express";
import mongoose from "mongoose";

import { getMongoConfig } from "../helpers/constants.js";

let cachedDb: typeof mongoose | null = null;

export const initMongoDB: RequestHandler = async (_req, _res, next) => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log("Already connected!");
    next();
    return;
  }

  try {
    const { user, password, url, db } = getMongoConfig();

    const connection = await mongoose.connect(
      `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${url}/${db}?retryWrites=true&w=majority&ssl=true`
    );

    console.log("Mongo connection successfully established!");
    cachedDb = connection;
    next();
  } catch (e) {
    console.log("Error while setting up mongo connection", e);
    next(e);
  }
};
