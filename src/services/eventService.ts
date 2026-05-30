import type { FilterQuery } from "mongoose";

import { EventCollection, type Event } from "../database/models/event.js";
import { SavedEventCollection } from "../database/models/savedEvent.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { parseItems } from "../parsers/parser.js";
import https from "node:https";

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
    return await EventCollection.findByIdAndUpdate(
      eventId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching event: " + message);
  }
};

export const getPopularEvents = async (limit = 10) => {
  try {
    const now = new Date();
    const events = await EventCollection.aggregate([
      {
        $match: {
          $or: [{ dateTime: { $gte: now } }, { dateTime: null }],
        },
      },
      {
        $lookup: {
          from: SavedEventCollection.collection.name,
          localField: "_id",
          foreignField: "eventId",
          as: "savedEvents",
        },
      },
      {
        $addFields: {
          actualSavedCount: { $size: "$savedEvents" },
        },
      },
      {
        $addFields: {
          computedSavedCount: {
            $max: ["$actualSavedCount", { $ifNull: ["$savedCount", 0] }],
          },
        },
      },
      {
        $addFields: {
          popularityScore: {
            $add: [
              { $multiply: ["$computedSavedCount", 3] },
              { $ifNull: ["$viewsCount", 0] },
            ],
          },
          savedCount: "$computedSavedCount",
          viewsCount: { $ifNull: ["$viewsCount", 0] },
        },
      },
      { $sort: { popularityScore: -1, savedCount: -1, viewsCount: -1, dateTime: 1, createdAt: -1 } },
      { $limit: limit },
      { $project: { savedEvents: 0, actualSavedCount: 0, computedSavedCount: 0, popularityScore: 0 } },
    ]);

    return events;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error fetching popular events: " + message);
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

export const updateEventSavedMetric = async (eventId: string, saved: boolean) => {
  try {
    const event = await EventCollection.findById(eventId);
    if (!event) {
      return null;
    }

    const currentSavedCount = event.savedCount ?? 0;
    const nextSavedCount = saved ? currentSavedCount + 1 : Math.max(currentSavedCount - 1, 0);

    return await EventCollection.findByIdAndUpdate(
      eventId,
      { savedCount: nextSavedCount },
      { new: true }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error("Error updating event saved metric: " + message);
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

export const searchEvents = async ({ page = 1, perPage = 15, sort = { dateTime: 1 }, title = "" }: EventQueryOptions) => {
  try {
    const offset = (page - 1) * perPage;
    const searchQuery = title.trim();
    const query: FilterQuery<Event> = {
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { place: { $regex: searchQuery, $options: "i" } },
      ],
    };

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
};

type Coordinates = { latitude: number; longitude: number };

const DNIPRO_CENTER: Coordinates = { latitude: 48.464718, longitude: 35.046183 };

const geocodeInDnipro = async (query: string): Promise<Coordinates | null> => {
  const searchQuery = `${query}, Дніпро, Україна`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", searchQuery);
  url.searchParams.set("limit", "1");

  const body = await new Promise<string>((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "dnipro-slay-api/1.0",
          },
        },
        (res) => {
          const chunks: Uint8Array[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        }
      )
      .on("error", reject);
  });

  try {
    const results = JSON.parse(body) as Array<{ lat: string; lon: string }>;
    const [first] = results;
    if (!first) {
      return null;
    }

    const latitude = Number(first.lat);
    const longitude = Number(first.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return { latitude, longitude };
  } catch {
    return null;
  }
};

export const getEventCoordinates = async (eventId: string): Promise<Coordinates | null> => {
  const event = await EventCollection.findById(eventId);
  if (!event) {
    return null;
  }

  const existingCoordinates = event.coordinates;
  const latitude = existingCoordinates?.latitude;
  const longitude = existingCoordinates?.longitude;
  if (
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined
  ) {
    return {
      latitude,
      longitude,
    };
  }

  const coordinates = await geocodeInDnipro(event.place);

  if (coordinates) {
    await EventCollection.findByIdAndUpdate(eventId, { coordinates });
    return coordinates;
  }

  return DNIPRO_CENTER;
};
