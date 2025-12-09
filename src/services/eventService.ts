import type { FilterQuery } from "mongoose";

import { EventCollection, type Event } from "../database/models/event.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { parseItems } from "../parsers/parser.js";

export type EventQueryFilters = Partial<
  Pick<Event, "typeOfEvent" | "place" | "site"> & {
    from?: string;
    to?: string;
    title?: string;
    minPrice?: number;
    maxPrice?: number;
  }
>;

export type EventQueryOptions = EventQueryFilters & {
  page?: number;
  perPage?: number;
  sort?: Record<string, 1 | -1>;
};

export const getAllEvents = async ({
  page = 1,
  perPage = 10,
  sort = { dateTime: 1 },
  ...filters
}: EventQueryOptions) => {
  const offset = (page - 1) * perPage;

  const query: FilterQuery<Event> = {};

  if (filters.title) {
    query.title = { $regex: filters.title, $options: "i" };
  }

  if (filters.typeOfEvent) {
    query.typeOfEvent = filters.typeOfEvent;
  }

  if (filters.place) {
    query.place = { $regex: filters.place, $options: "i" };
  }

  if (filters.site) {
    query.site = filters.site;
  }

  if (filters.minPrice !== undefined) {
    query.minPrice = { $gte: filters.minPrice };
  }

  if (filters.maxPrice !== undefined) {
    query.maxPrice = { $lte: filters.maxPrice };
  }

  if (filters.from || filters.to) {
    query.dateTime = {};

    if (filters.from) {
      query.dateTime.$gte = new Date(filters.from);
    }
    if (filters.to) {
      query.dateTime.$lte = new Date(filters.to);
    }
  }

  try {
    const totalEvents = await EventCollection.countDocuments(query);
    const eventsList = await EventCollection.find(query)
      .sort(sort)
      .skip(offset)
      .limit(perPage);

    const paginationInfo = calculatePaginationData(totalEvents, page, perPage);

    return {
      ...paginationInfo,
      events: eventsList,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching events: " + message);
  }
};

export const getEventById = async (eventId: string) => {
  try {
    return await EventCollection.findById(eventId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching event: " + message);
  }
};

export const createEvent = async (eventData: Event) => {
  try {
    return await EventCollection.create(eventData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error creating event: " + message);
  }
};

export const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
  try {
    return await EventCollection.findByIdAndUpdate(eventId, eventData, { new: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error updating event: " + message);
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    return await EventCollection.findByIdAndDelete(eventId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error deleting event: " + message);
  }
};

export const getUpcomingEvents = async (limit = 10) => {
  try {
    const now = new Date();
    return await EventCollection.find({ dateTime: { $gte: now } })
      .sort({ dateTime: 1 })
      .limit(limit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching upcoming events: " + message);
  }
};

export const searchEvents = async (query: string, limit = 15) => {
  try {
    return await EventCollection.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { place: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ dateTime: 1 })
      .limit(limit);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error searching events: " + message);
  }
};


export const parseEventsService = async (htmlItems: string | string[])=>{

  const items = await parseItems(htmlItems);
  
  const promises = items.map(el=>EventCollection.create(el));
  const res = await Promise.allSettled(promises);

  res.forEach(el=>{
    if(el.status === 'rejected'){
      console.log('ERROR', el.reason)
    }
  })

  return res.filter(el=>el.status === 'fulfilled').map(el=>el.value);
}