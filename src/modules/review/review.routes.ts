import { Router } from "express";
import { ReviewController } from "./review.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = Router() as any;

router.get("/my", auth(UserRole.USER, UserRole.ADMIN), ReviewController.getMyReviews);
router.get("/event/:eventId", ReviewController.getReviewsByEvent);

router.post(
    "/",
    auth(UserRole.USER, UserRole.ADMIN),
    ReviewController.createReview
);
router.patch(
    "/:reviewId",
    auth(UserRole.USER, UserRole.ADMIN),
    ReviewController.updateReview
);
router.delete(
    "/:reviewId",
    auth(UserRole.USER, UserRole.ADMIN),
    ReviewController.deleteReview
);

export default router;