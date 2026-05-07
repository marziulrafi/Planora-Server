import { prisma } from "../../lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2026-04-22.dahlia",
});

type PaymentGatewaySuccessInput = {
    tranId: string;
    sessionId?: string;
};

const getClientUrl = () =>
    String(
        process.env.CLIENT_URL ||
        process.env.APP_URL ||
        process.env.FRONTEND_URL ||
        "http://localhost:3000"
    )
        .trim()
        .replace(/\/+$/, "")
        .replace(/\/api$/i, "");

const initiatePayment = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (event.fee <= 0) throw new Error("This event is free, no payment required");
    if (event.ownerId === userId) throw new Error("You cannot pay for your own event");

    const tranId = `PLANORA_${Date.now()}_${userId.slice(0, 6)}`;

    await prisma.payment.create({
        data: { tranId, amount: event.fee, userId, eventId, status: "INITIATED" },
    });

    const clientUrl = getClientUrl();

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: user.email,
        metadata: {
            tranId,
            userId,
            eventId,
        },
        line_items: [
            {
                price_data: {
                    currency: "bdt",
                    product_data: {
                        name: event.title,
                        description: "Event registration fee",
                    },
                    unit_amount: Math.round(event.fee * 100),
                },
                quantity: 1,
            },
        ],
        success_url: `${clientUrl}/payment/success?tran_id=${tranId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientUrl}/payment/cancel?tran_id=${tranId}`,
    });

    if (!session.url) {
        throw new Error("Failed to initialize Stripe payment session");
    }

    return { gatewayUrl: session.url, paymentUrl: session.url, tranId, sessionId: session.id };
};


type RawStripeEvent = {
    type: string;
    data: {
        object: {
            id: string;
            payment_status?: string;
            metadata?: Record<string, string>;
        };
    };
};

const handleWebhook = async (rawBody: Buffer, signature: string) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let stripeEvent: RawStripeEvent;
    try {
        stripeEvent = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        ) as unknown as RawStripeEvent;
    } catch (err) {
        throw new Error(
            `Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`
        );
    }

    const session = stripeEvent.data.object;

    if (stripeEvent.type === "checkout.session.completed") {
        if (session.payment_status === "paid") {
            const tranId = session.metadata?.tranId;
            if (tranId) {
                await handleSuccess({ tranId, sessionId: session.id });
            }
        }
    }

    if (stripeEvent.type === "checkout.session.expired") {
        const tranId = session.metadata?.tranId;
        if (tranId) {
            await handleFail(tranId);
        }
    }

    return { received: true };
};

const handleSuccess = async ({ tranId, sessionId }: PaymentGatewaySuccessInput) => {
    const payment = await prisma.payment.findUnique({ where: { tranId } });
    if (!payment) throw new Error("Payment not found");

    if (payment.status === "SUCCESS") {
        return payment;
    }

    if (sessionId) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
            throw new Error("Stripe session is not marked as paid");
        }
    }

    const [updatedPayment, participant] = await prisma.$transaction([
        prisma.payment.update({
            where: { tranId },
            data: { status: "SUCCESS" },
        }),
        prisma.participant.upsert({
            where: {
                userId_eventId: { userId: payment.userId, eventId: payment.eventId },
            },
            create: {
                userId: payment.userId,
                eventId: payment.eventId,
                status: "PENDING",
            },
            update: { status: "PENDING" },
        }),
    ]);

    return { payment: updatedPayment, participant };
};

const getPaymentByTranId = async (tranId: string) => {
    return prisma.payment.findUnique({
        where: { tranId },
        include: {
            event: { select: { id: true, title: true, date: true } },
            user: { select: { id: true, name: true, email: true } },
        },
    });
};

const handleFail = async (tranId: string) => {
    await prisma.payment.updateMany({
        where: { tranId },
        data: { status: "FAILED" },
    });
};

const handleCancel = async (tranId: string) => {
    await prisma.payment.updateMany({
        where: { tranId },
        data: { status: "CANCELLED" },
    });
};

const getMyPayments = async (userId: string) => {
    return await prisma.payment.findMany({
        where: { userId },
        include: {
            event: { select: { id: true, title: true, date: true } },
        },
        orderBy: { createdAt: "desc" },
    });
};

export const PaymentService = {
    initiatePayment,
    handleWebhook,
    handleSuccess,
    handleFail,
    handleCancel,
    getMyPayments,
    getPaymentByTranId,
};