import { Router } from "express";
import { InvitationController } from "./invitation.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

router.get(
    "/my",
    auth(UserRole.USER, UserRole.ADMIN),
    InvitationController.getMyInvitations
);
router.post(
    "/",
    auth(UserRole.USER, UserRole.ADMIN),
    InvitationController.sendInvitation
);
router.patch(
    "/:invitationId/accept",
    auth(UserRole.USER, UserRole.ADMIN),
    InvitationController.acceptInvitation
);
router.patch(
    "/:invitationId/decline",
    auth(UserRole.USER, UserRole.ADMIN),
    InvitationController.declineInvitation
);

export default router;