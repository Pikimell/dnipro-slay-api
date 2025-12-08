import mongoose from "mongoose";

import { SavedEventCollection, type SavedEvent } from "../database/models/savedEvent.js";

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

type SavePayload = {userId:string;eventId:string; };

export const saveEventForUser = async ({ userId, eventId }: SavePayload) => {
  return SavedEventCollection.create({
    userId: toObjectId(userId),
    eventId: toObjectId(eventId),
  });
};

export const removeSavedEvent = async (savedEventId: string) => {
  return SavedEventCollection.findByIdAndDelete(savedEventId);
};

export const getSavedEventsByUser = async (userId: string) => {
  return SavedEventCollection.find({ userId: toObjectId(userId) })
    .populate("eventId")
    .sort({ createdAt: -1 });
};

export const isEventSavedByUser = async ({ userId, eventId }: SavePayload) => {
  const existing = await SavedEventCollection.findOne({
    userId: toObjectId(userId),
    eventId: toObjectId(eventId),
  });
  return Boolean(existing);
};

export const toggleSavedEvent = async ({ userId, eventId }: SavePayload) => {
  const existing = await SavedEventCollection.findOne({
    userId: toObjectId(userId),
    eventId: toObjectId(eventId),
  });

  if (existing) {
    await SavedEventCollection.findByIdAndDelete(existing._id);
    return { saved: false };
  }

  const created = await saveEventForUser({ userId, eventId });
  return { saved: true, savedEvent: created };
};
