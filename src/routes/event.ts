import { Router } from "express";

import * as eventControllers from "../controllers/eventController.js";

const router = Router();

router.get("/search", eventControllers.searchEventsController);
router.get("/upcoming", eventControllers.getUpcomingEventsController);
router.get("/:eventId/coordinates", eventControllers.getEventCoordinatesController);
router.get("/", eventControllers.getAllEventsController);
router.get("/:eventId", eventControllers.getEventByIdController);
router.post("/parse-events", eventControllers.parseEventsController);
router.post("/", eventControllers.createEventController);
router.put("/:eventId", eventControllers.updateEventController);
router.delete("/:eventId", eventControllers.deleteEventController);

export default router;
