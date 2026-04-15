import { Request, Response } from "express";
import { ReviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.userId = user?.id;
        const result = await ReviewService.createReview(req.body);
        res.status(201).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Review creation failed";
        res.status(400).json({ error: msg, details: e });
    }
};

const getReviewsByEvent = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const result = await ReviewService.getReviewsByEvent(eventId);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch reviews", details: e });
    }
};

const getMyReviews = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const result = await ReviewService.getMyReviews(user?.id as string);
        res.status(200).json(result);
    } catch (e) {
        res.status(400).json({ error: "Failed to fetch your reviews", details: e });
    }
};

const updateReview = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { reviewId } = req.params;
        const result = await ReviewService.updateReview(reviewId, user?.id as string, req.body);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Review update failed";
        res.status(400).json({ error: msg, details: e });
    }
};

const deleteReview = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { reviewId } = req.params;
        const result = await ReviewService.deleteReview(reviewId, user?.id as string, user?.role as string);
        res.status(200).json(result);
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Review delete failed";
        res.status(400).json({ error: msg, details: e });
    }
};

export const ReviewController = {
    createReview,
    getReviewsByEvent,
    getMyReviews,
    updateReview,
    deleteReview,
};