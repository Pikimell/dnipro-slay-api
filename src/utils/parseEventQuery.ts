import type { ParsedQs } from "qs";

import type { EventQueryFilters } from "../services/eventService.js";
import { EventType } from "../database/models/event.js";

type EventQuery = ParsedQs & {
  page?: string | string[];
  perPage?: string | string[];
  sortField?: string | string[];
  sortOrder?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
};

const parseString = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : undefined;
  }
  return typeof value === "string" ? value : undefined;
};

const parseNumber = (value: unknown, fallback: number): number => {
  if (Array.isArray(value)) {
    return parseNumber(value[0], fallback);
  }
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (Array.isArray(value)) {
    return parseOptionalNumber(value[0]);
  }
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseEventQuery = (query: EventQuery) => {
  const page = parseNumber(query.page, 1);
  const perPage = parseNumber(query.perPage, 10);

  const sortField = parseString(query.sortField) || "dateTime";
  const sortOrder = parseString(query.sortOrder) === "desc" ? -1 : 1;

  const filters: EventQueryFilters = {};

  const title = parseString(query.title);
  if (title) filters.title = title;

  const q = parseString((query as ParsedQs & { q?: string | string[] }).q);
  if (q && !filters.title) filters.title = q;

  const typeOfEvent = parseString(query.typeOfEvent) as EventType;
  if (typeOfEvent) filters.typeOfEvent = typeOfEvent;

  const place = parseString(query.place);
  if (place) filters.place = place;

  const site = parseString(query.site);
  if (site) filters.site = site;

  const from = parseString(query.from);
  if (from) filters.from = from;

  const to = parseString(query.to);
  if (to) filters.to = to;

  const minPrice = parseOptionalNumber(query.minPrice);
  if (minPrice !== undefined) filters.minPrice = minPrice;

  const maxPrice = parseOptionalNumber(query.maxPrice);
  if (maxPrice !== undefined) filters.maxPrice = maxPrice;

  return {
    pagination: { page, perPage, sort: { [sortField]: sortOrder as 1 | -1 } },
    filters,
  };
};
