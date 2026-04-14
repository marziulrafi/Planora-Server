import express, { Router } from "express";
import { EventController } from "./event.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

router.get("/", EventController.getAllEvents);
router.get("/featured", EventController.getFeaturedEvent);
router.get("/upcoming", EventController.getUpcomingEvents);
router.get("/:eventId", EventController.getEventById);

router.post(
    "/",
    auth(UserRole.USER, UserRole.ADMIN),
    EventController.createEvent
);
router.patch(
    "/:eventId",
    auth(UserRole.USER, UserRole.ADMIN),
    EventController.updateEvent
);
router.delete(
    "/:eventId",
    auth(UserRole.USER, UserRole.ADMIN),
    EventController.deleteEvent
);
router.patch(
    "/:eventId/feature",
    auth(UserRole.ADMIN),
    EventController.setFeaturedEvent
);

export default router;