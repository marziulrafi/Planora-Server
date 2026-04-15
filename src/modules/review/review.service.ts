import { prisma } from "../../lib/prisma";

const createReview = async (payload: {
    rating: number;
    comment: string;
    userId: string;
    eventId: string;
}) => {
    await prisma.event.findUniqueOrThrow({ where: { id: payload.eventId } });

    const participated = await prisma.participant.findUnique({
        where: {
            userId_eventId: { userId: payload.userId, eventId: payload.eventId },
        },
    });
    if (!participated || participated.status !== "APPROVED") {
        throw new Error("You must be an approved participant to review this event");
    }

    const existing = await prisma.review.findUnique({
        where: { userId_eventId: { userId: payload.userId, eventId: payload.eventId } },
    });
    if (existing) throw new Error("You have already reviewed this event");

    return await prisma.review.create({ data: payload });
};

const getReviewsByEvent = async (eventId: string) => {
    return await prisma.review.findMany({
        where: { eventId },
        include: {
            user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

const getMyReviews = async (userId: string) => {
    return await prisma.review.findMany({
        where: { userId },
        include: {
            event: { select: { id: true, title: true, date: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

const updateReview = async (
    reviewId: string,
    userId: string,
    data: { rating?: number; comment?: string }
) => {
    const review = await prisma.review.findFirst({ where: { id: reviewId, userId } });
    if (!review) throw new Error("Review not found or you are not the author");

    return await prisma.review.update({ where: { id: reviewId }, data });
};

const deleteReview = async (reviewId: string, userId: string, role: string) => {
    const review = await prisma.review.findUniqueOrThrow({ where: { id: reviewId } });

    if (review.userId !== userId && role !== "ADMIN") {
        throw new Error("You are not authorized to delete this review");
    }

    return await prisma.review.delete({ where: { id: reviewId } });
};

export const ReviewService = {
    createReview,
    getReviewsByEvent,
    getMyReviews,
    updateReview,
    deleteReview,
};