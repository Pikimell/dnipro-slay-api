import { Router } from "express";

import * as savedEventControllers from "../controllers/savedEventController.js";

const router = Router();

router.get("/user/:userId", savedEventControllers.getSavedEventsByUserController);
router.get(
  "/user/:userId/status/:eventId",
  savedEventControllers.isEventSavedController
);
router.post("/", savedEventControllers.saveEventController);
router.post("/toggle", savedEventControllers.toggleSavedEventController);
router.delete("/:savedEventId", savedEventControllers.removeSavedEventController);

export default router;
