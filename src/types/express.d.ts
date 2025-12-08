import type { UserDocument } from "../database/models/user.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      typeAccount?: string | null;
    }
  }
}

export {};
