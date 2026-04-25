import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import { sendError, sendSuccess } from "../../lib/http";

const createReview = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.userId = user?.id;
        const result = await ReviewService.createReview(req.body);
        sendSuccess(res, result, 201);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Review creation failed", 400);
    }
};

const getReviewsByEvent = async (req: Request, res: Response) => {
    try {
        const eventId = String(req.params.eventId);
        const result = await ReviewService.getReviewsByEvent(eventId);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch reviews", 400);
    }
};

const getMyReviews = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await ReviewService.getMyReviews(user?.id as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, "Failed to fetch your reviews", 400);
    }
};

const updateReview = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const reviewId = String(req.params.reviewId);
        const result = await ReviewService.updateReview(reviewId, user?.id as string, req.body);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Review update failed", 400);
    }
};

const deleteReview = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const reviewId = String(req.params.reviewId);
        const result = await ReviewService.deleteReview(reviewId, user?.id as string, user?.role as string);
        sendSuccess(res, result);
    } catch (e) {
        sendError(res, e instanceof Error ? e.message : "Review delete failed", 400);
    }
};

export const ReviewController = {
    createReview,
    getReviewsByEvent,
    getMyReviews,
    updateReview,
    deleteReview,
};