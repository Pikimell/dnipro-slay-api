import { Router } from "express";

import authRouter from "./auth.js";
import eventRouter from "./event.js";
import savedEventRouter from "./savedEvent.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/events", eventRouter);
router.use("/saved-events", savedEventRouter);

export default router;
