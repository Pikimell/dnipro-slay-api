# Last Changes

- Added `coordinates` (latitude/longitude) to the `Event` schema for storing geolocation.
- Implemented geolocation lookup via Nominatim restricted to Dnipro, Ukraine, with fallback to city center when not found; results are cached to the event.
- Added endpoint `GET /events/:eventId/coordinates` to return stored coordinates or trigger lookup and persistence when missing.
- Documented the new coordinates field and endpoint details in `API_ENDPOINTS.md`.
