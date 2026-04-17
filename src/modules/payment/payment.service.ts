import { prisma } from "../../lib/prisma";

const SSLCommerzPayment = require("sslcommerz-lts");

const initiatePayment = async (userId: string, eventId: string) => {
    const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (event.fee <= 0) throw new Error("This event is free, no payment required");
    if (event.ownerId === userId) throw new Error("You cannot pay for your own event");

    const tranId = `PLANORA_${Date.now()}_${userId.slice(0, 6)}`;

    await prisma.payment.create({
        data: { tranId, amount: event.fee, userId, eventId, status: "INITIATED" },
    });

    const storeId = process.env.SSLCOMMERZ_STORE_ID as string;
    const storePass = process.env.SSLCOMMERZ_STORE_PASS as string;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
    const serverUrl = process.env.SERVER_URL as string;

    const sslData = {
        store_id: storeId,
        store_passwd: storePass,
        total_amount: event.fee,
        currency: "BDT",
        tran_id: tranId,
        success_url: `${serverUrl}/api/payment/success`,
        fail_url: `${serverUrl}/api/payment/fail`,
        cancel_url: `${serverUrl}/api/payment/cancel`,
        cus_name: user.name,
        cus_email: user.email,
        cus_add1: "Bangladesh",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        cus_phone: "01700000000",
        shipping_method: "NO",
        product_name: event.title,
        product_category: "Event",
        product_profile: "general",
    };

    const sslcz = new SSLCommerzPayment(storeId, storePass, isLive);
    const apiResponse = await sslcz.init(sslData);

    if (!apiResponse?.GatewayPageURL) {
        throw new Error("Failed to initialize payment gateway");
    }

    return { gatewayUrl: apiResponse.GatewayPageURL, tranId };
};

const handleSuccess = async (tranId: string) => {
    const payment = await prisma.payment.findUniqueOrThrow({ where: { tranId } });

    await prisma.$transaction([
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
                paidAt: new Date(),
            },
            update: { status: "PENDING", paidAt: new Date() },
        }),
    ]);
};


export const PaymentService = {
    initiatePayment,
    handleSuccess
}