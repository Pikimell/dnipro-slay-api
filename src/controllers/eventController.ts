import { RequestHandler } from "express";

import * as eventServices from "../services/eventService.js";
import { parseEventQuery } from "../utils/parseEventQuery.js";

const parseLimit = (value: unknown, fallback: number): number => {
  if (Array.isArray(value)) {
    return parseLimit(value[0], fallback);
  }
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const getAllEventsController: RequestHandler = async (req, res, next) => {
  try {
    const { pagination, filters } = parseEventQuery(req.query);
    const result = await eventServices.getAllEvents({
      ...pagination,
      ...filters,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getEventByIdController: RequestHandler = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const event = await eventServices.getEventById(eventId);

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.status(200).json(event);
  } catch (err) {
    next(err);
  }
};

export const createEventController: RequestHandler = async (req, res, next) => {
  try {
    const event = await eventServices.createEvent(req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

export const updateEventController: RequestHandler = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const updatedEvent = await eventServices.updateEvent(eventId, req.body);

    if (!updatedEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    next(err);
  }
};

export const deleteEventController: RequestHandler = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const deletedEvent = await eventServices.deleteEvent(eventId);

    if (!deletedEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.status(200).json({ message: "Event deleted", event: deletedEvent });
  } catch (err) {
    next(err);
  }
};

export const getUpcomingEventsController: RequestHandler = async (req, res, next) => {
  try {
    const { pagination } = parseEventQuery(req.query);
    const limit = parseLimit(req.query.limit, pagination.perPage);
    const events = await eventServices.getUpcomingEvents(limit);
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
};

export const parseEventsController: RequestHandler = async (req, res, next) => {
  try {

    const body = req.body;
    const {htmlItem} = body;
    const events = await eventServices.parseEventsService(htmlItem);
    console.log('EVENTS', events);
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
};

export const searchEventsController: RequestHandler = async (req, res, next) => {
  try {
    const { filters, pagination } = parseEventQuery(req.query);
    const query = filters.title ?? "";

    if (!query.trim()) {
      res.status(400).json({ message: "Missing search query" });
      return;
    }

    const limit = parseLimit(req.query.limit, pagination.perPage || 15);
    const events = await eventServices.searchEvents(query, limit);
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
};
