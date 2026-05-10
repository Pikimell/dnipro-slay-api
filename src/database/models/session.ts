import { HydratedDocument, InferSchemaType, model, Schema, Types } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    accessTokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    accessTokenValidUntil: {
      type: Date,
      required: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type Session = InferSchemaType<typeof sessionSchema> & {
  userId: Types.ObjectId;
};
export type SessionDocument = HydratedDocument<Session>;

export const SessionCollection = model<Session>("sessions", sessionSchema);
