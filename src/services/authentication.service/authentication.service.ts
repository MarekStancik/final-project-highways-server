import { Request, Response, NextFunction } from "express";
import crypto from "crypto"
import uuid from "uuid"
import { ApiResponse } from "../../api/utils/api-response";
import { UserSession, UserSpec, User } from "../../models";
import { LogService } from "../log.service";
import { AuthenticationError } from "./authentication.error";
import { DatabaseService } from "../database.service";

export class AuthenticationService {

    private static readonly SESSION_TOKEN_HEADER = "X-Session-Token";

    private log: LogService = LogService.instance;

    constructor(private database: DatabaseService){

    }

    public authenticate(username: string, password: string): UserSession {
        const user = this.authenticateUser(username, password);
        const session = this.database.create(UserSession);
        session.user = new UserSpec();
        session.user.id = user.id;
        session.token = uuid.v4();
        session.lifetime = 200000;
        return this.database.update(session);
    }

    private authenticateUser(username: string, password: string): UserSpec {
        const query = { username, password: crypto.createHash("sha256").update(password, "utf8").digest("hex") };
        const user = this.database.get(User, query);
        if (!user) {
            throw new AuthenticationError("User not found or invalid password has been entered");
        }
        if (!user.enabled) {
            throw new AuthenticationError("User is disabled");
        }
        return {
            id: user.id
        };
    }

    public mwfRequireAuthentication() {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                if (req.session) {
                    throw new AuthenticationError("Authentication middleware may only occur once in the pipeline");
                }

                const sessionToken = req.get(AuthenticationService.SESSION_TOKEN_HEADER) || null;
                if (!sessionToken) {
                    return ApiResponse.Error.Unauthorized(next);
                }

                const session = this.getSessionByToken(sessionToken);
                
                session.lastRequestDate = new Date();
                this.database.update(session);

                req.session = session;
                req.user = this.database.get(User,{id: session.user.id});

                return next();
            } catch (error) {
                if (error instanceof AuthenticationError && error.code) {
                    return ApiResponse.Error.Unauthorized(next, undefined, error.message, error.code === "SESSION_EXPIRED" ? { reason: error.code } : null);
                } else {
                    return ApiResponse.Error.InternalServerError(next, error);
                }
            }
        };
    }

    private getSessionByToken(token: string): UserSession {
        const session = this.database.get(UserSession, {token});
        if (!session) {
            throw new AuthenticationError("Session not found", "SESSION_NOT_FOUND");
        }
        if (session.expiryDate || new Date().getTime() - session.lastRequestDate.getTime() > session.lifetime) {
            throw new AuthenticationError("Session has already expired", "SESSION_EXPIRED");
        }
        return session;
    }

}