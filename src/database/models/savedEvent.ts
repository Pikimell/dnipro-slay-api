import { HydratedDocument, InferSchemaType, model, Schema } from "mongoose";

const savedEventSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "events",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

savedEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export type SavedEvent = InferSchemaType<typeof savedEventSchema>;
export type SavedEventDocument = HydratedDocument<SavedEvent>;

export const SavedEventCollection = model<SavedEvent>("savedEvents", savedEventSchema);
