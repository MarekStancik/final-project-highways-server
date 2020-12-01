import { NextFunction, Request, Response, Router } from "express";
import { UserSession } from "../../models";
import { AuthenticationError } from "../../services/authentication.service/authentication.error";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { DatabaseService } from "../../services/database.service";
import { LogService } from "../../services/log.service";
import { ApiResponse } from "../utils/api-response";

export class AuthenticationApi {

    private log: LogService = LogService.instance;

    constructor(private authenticationService: AuthenticationService, private database: DatabaseService) {

    }

    public install(router: Router) : void {
        router.post("/authentication", this.mwAuthenticate.bind(this));
        router.delete("/authentication", this.authenticationService.mwfRequireAuthentication(), this.mwLogout.bind(this));
        router.get("/authentication", this.authenticationService.mwfRequireAuthentication(), this.mwGetAuthenticationInfo.bind(this));
    }

    private mwAuthenticate(req: Request, res: Response, next: NextFunction): void {
        try {
            const username = req.body.username;
            const password = req.body.password;
            if (!username || !password || username.length < 1 || password.length < 1) {
                return ApiResponse.Error.BadRequest(next);
            }
            try {
                const session = this.authenticationService.authenticate(username, password);
                return ApiResponse.Success.Ok(req, next, { sessionToken: session.token, sessionExpiryDate: new Date(session.startDate.getTime() + session.lifetime) });
            } catch (error) {
                if (error instanceof AuthenticationError) {
                    return ApiResponse.Error.Conflict(next, "Authentication failed", error.message);
                }
                throw error;
            }
        } catch (error) {
            this.log.error(error);
            return ApiResponse.Error.InternalServerError(next);
        }
    }

    private mwGetAuthenticationInfo(req: Request, res: Response, next: NextFunction): void {
        return ApiResponse.Success.Ok(req, next, {
            session: req.session.filter([
                "token",
                "_meta"
            ], true),
            user: req.user.filter([
                "password",
                "_meta"
            ], true)
        });
    }

    private mwLogout(req: Request, res: Response, next: NextFunction): void {
        try {
            const session = req.session as UserSession;
            session.expiryDate = new Date();
            this.database.update(session);
            return ApiResponse.Success.Ok(req, next, {});
        } catch (error) {
            this.log.error(error);
            return ApiResponse.Error.InternalServerError(next);
        }
    }
}