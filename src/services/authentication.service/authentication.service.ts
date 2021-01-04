import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { Inject, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import * as uuid from "uuid";
import { ApiResponse } from "../../api/utils/api-response";
import { User, UserSession, UserSpec } from "../../models";
import { AuthorizationType, OperationType, Permissions, ResourceType } from "../../models/permission.model";
import { DatabaseService } from "../database.service/database.service";
import { AuthenticationError } from "./authentication.error";

@Singleton
@OnlyInstantiableByContainer
export class AuthenticationService {

    @Inject private database: DatabaseService

    public static passHash(pass: string): string {
        return crypto.createHash("sha256").update(pass, "utf8").digest("hex")
    }

    private static readonly SESSION_TOKEN_HEADER = "X-Session-Token";

    public async authenticate(username: string, password: string): Promise<UserSession> {
        const user = await this.authenticateUser(username, password);
        const session = await this.database.create("session",{} as UserSession);
        session.user = user;
        session.token = uuid.v4();
        session.lifetime = 20000000;
        session.startDate = session.lastRequestDate = new Date();
        session.permissions = Permissions[user.user.authorization];
        return await this.database.update("session",session);
    }

    private async authenticateUser(username: string, password: string): Promise<UserSpec> {
        const query = { username, password: AuthenticationService.passHash(password) };
        const user = await this.database.get<User>("user", query);
        if (!user) {
            throw new AuthenticationError("User not found or invalid password has been entered");
        }
        if (!user.enabled) {
            throw new AuthenticationError("User is disabled");
        }
        return {
            id: user.id,
            user
        };
    }

    public mwfRequireAuthentication() {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                if (req.session) {
                    throw new AuthenticationError("Authentication middleware may only occur once in the pipeline");
                }

                const sessionToken = req.get(AuthenticationService.SESSION_TOKEN_HEADER) || null;
                if (!sessionToken) {
                    return ApiResponse.Error.Unauthorized(next);
                }

                const session = await this.getSessionByToken(sessionToken);
                session.lastRequestDate = new Date();
                await this.database.update("session",session);

                req.session = session;
                const user = await this.database.get<User>("user", { id: session.user.id });
                req.user = user;
                req.permissions = Permissions[user.authorization];

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

    public mwfRequireAuthorization(resource: ResourceType, operation: OperationType) {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                if (!req.session) {
                    throw new AuthenticationError("Authorization middleware may only be installed if authentication middleware is installed in the pipeline");
                }
                const session = await this.getSessionByToken(req.session.token);
                const user = await this.database.get<User>("user", { id: session.user.id });
                if (this.evaluatePermissions(resource, operation, user.authorization)) {
                    return next();
                }
                return ApiResponse.Error.PermissionDenied(next);
            } catch (error) {
                return ApiResponse.Error.InternalServerError(next, error);
            }
        }
    }

    public async getSessionByToken(token: string): Promise<UserSession> {
        const session = await this.database.get<UserSession>("session", { token });
        if (!session) {
            throw new AuthenticationError("Session not found", "SESSION_NOT_FOUND");
        }
        if (session.expiryDate || new Date().getTime() - session.lastRequestDate.getTime() > session.lifetime) {
            throw new AuthenticationError("Session has already expired", "SESSION_EXPIRED");
        }
        return session;
    }

    private evaluatePermissions(resource: ResourceType, operation: OperationType, role: AuthorizationType): boolean {
        return Permissions[role]?.[resource]?.includes(operation);
    }
}