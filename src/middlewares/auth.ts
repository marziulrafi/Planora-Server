import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { sendError } from "../lib/http";

export enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN",
}

export type AuthUser = {
    id: string;
    email?: string;
    role: UserRole;
};

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

const authMiddleware =
    (...roles: UserRole[]) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const headers = fromNodeHeaders(req.headers);

                const session = await auth.api.getSession({ headers });

                if (!session?.user) {
                    return sendError(res, "Unauthorized", 401);
                }

                const user: AuthUser = {
                    id: session.user.id,
                    email: session.user.email,
                    role: ((session.user as any).role as UserRole) || UserRole.USER,
                };

                if (roles.length && !roles.includes(user.role)) {
                    return sendError(res, "Forbidden", 403);
                }

                req.user = user;
                return next();
            } catch (error) {
                console.error("Auth middleware error:", error);
                return sendError(res, "Invalid session", 401);
            }
        };

export default authMiddleware;