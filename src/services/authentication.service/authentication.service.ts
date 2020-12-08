import { Request, Response, NextFunction } from "express";
import crypto from "crypto"
import * as uuid from "uuid"
import { ApiResponse } from "../../api/utils/api-response";
import { UserSession, UserSpec, User } from "../../models";
import { LogService } from "../log.service";
import { AuthenticationError } from "./authentication.error";
import { DatabaseService } from "../database.service/database.service";
import { AuthorizationType, OperationType, Permissions, ResourceType } from "../../models/permission.model";

export class AuthenticationService {

    private static readonly SESSION_TOKEN_HEADER = "X-Session-Token";

    private log: LogService = LogService.instance;

    constructor(private database: DatabaseService) {

    }

    public async authenticate(username: string, password: string): Promise<UserSession> {
        const user = await this.authenticateUser(username, password);
        const session = await this.database.create(UserSession);
        session.user = new UserSpec();
        session.user.id = user.id;
        session.token = uuid.v4();
        session.lifetime = 20000000;
        session.startDate = session.lastRequestDate = new Date();
        return await this.database.update(session);
    }

    private async authenticateUser(username: string, password: string): Promise<UserSpec> {
        const query = { username, password: crypto.createHash("sha256").update(password, "utf8").digest("hex") };
        const user = await this.database.get(User, query);
        if (!user) {
            throw new AuthenticationError("User not found or invalid password has been entered");
        }
        if (!user.enabled) {
            throw new AuthenticationError("User is disabled");
        }
        return {
            id: user._id
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
                await this.database.update(session);

                req.session = session;
                req.user = await this.database.get(User, { id: session.user.id });

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
                const user = await this.database.get(User, {id: session.user.id});
                if(!this.evaluatePermissions(resource,operation,user.authorization)){
                    return next();
                }
                return ApiResponse.Error.PermissionDenied(next);
            } catch (error) {
                return ApiResponse.Error.InternalServerError(next, error);
            }
        }
    }

    public async getSessionByToken(token: string): Promise<UserSession> {
        const session = await this.database.get(UserSession, { token });
        if (!session) {
            throw new AuthenticationError("Session not found", "SESSION_NOT_FOUND");
        }
        if (session.expiryDate || new Date().getTime() - session.lastRequestDate.getTime() > session.lifetime) {
            throw new AuthenticationError("Session has already expired", "SESSION_EXPIRED");
        }
        return session;
    }

    private evaluatePermissions(resource: ResourceType,operation: OperationType, role: AuthorizationType): boolean {
        return Permissions[role][resource]?.includes(operation);
    }
}