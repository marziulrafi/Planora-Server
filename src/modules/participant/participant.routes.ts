import { Router } from "express";
import { ParticipantController } from "./participant.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

router.get(
    "/my-events",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.getMyJoinedEvents
);
router.get(
    "/my",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.getMyJoinedEvents
);

router.post(
    "/",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.createParticipant
);
router.post(
    "/:eventId/join",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.joinFreePublicEvent
);
router.post(
    "/:eventId/request",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.requestToJoin
);
router.patch(
    "/:eventId/participants/:userId/approve",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.approveParticipant
);
router.patch(
    "/:eventId/participants/:userId/reject",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.rejectParticipant
);
router.patch(
    "/:eventId/participants/:userId/ban",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.banParticipant
);

router.get(
    "/:eventId",
    auth(UserRole.USER, UserRole.ADMIN),
    ParticipantController.getParticipantsByEvent
);

export default router;