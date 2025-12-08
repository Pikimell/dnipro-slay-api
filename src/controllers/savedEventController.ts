import { RequestHandler } from "express";

import * as savedEventServices from "../services/savedEventService.js";

export const saveEventController: RequestHandler = async (req, res, next) => {
  try {
    const { userId, eventId } = req.body as { userId: string; eventId: string };
    const saved = await savedEventServices.saveEventForUser({ userId, eventId });
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const removeSavedEventController: RequestHandler = async (req, res, next) => {
  try {
    const savedEventId = req.params.savedEventId;
    const deleted = await savedEventServices.removeSavedEvent(savedEventId);

    if (!deleted) {
      res.status(404).json({ message: "Saved event not found" });
      return;
    }

    res.status(200).json({ message: "Saved event removed", savedEvent: deleted });
  } catch (err) {
    next(err);
  }
};

export const getSavedEventsByUserController: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const savedEvents = await savedEventServices.getSavedEventsByUser(userId);
    res.status(200).json(savedEvents);
  } catch (err) {
    next(err);
  }
};

export const isEventSavedController: RequestHandler = async (req, res, next) => {
  try {
    const { userId, eventId } = req.params as { userId: string; eventId: string };
    const isSaved = await savedEventServices.isEventSavedByUser({ userId, eventId });
    res.status(200).json({ saved: isSaved });
  } catch (err) {
    next(err);
  }
};

export const toggleSavedEventController: RequestHandler = async (req, res, next) => {
  try {
    const { userId, eventId } = req.body as { userId: string; eventId: string };
    const result = await savedEventServices.toggleSavedEvent({ userId, eventId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
