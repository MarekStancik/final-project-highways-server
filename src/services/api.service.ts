import expressBodyParser from "body-parser";
import express, { Express, NextFunction, Request, Response } from "express";
import expressWs from "express-ws";
import { Inject, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import { ApiV1 } from "../api/api-v1";
import { ApiResponse } from "../api/utils/api-response";
import { ApiError } from "../api/utils/api.error";
import { WsApiV1 } from "../api/ws-api-v1";
import { ConfigService } from "./config.service";
import { LogService } from "./log.service";

@Singleton
@OnlyInstantiableByContainer
export class ApiService {

    private app: Express;
    @Inject private log: LogService;
    @Inject private config: ConfigService;

    constructor() {
        this.app = express();
    }

    public initialize() : void {
        
        // Enable WebSockets
        expressWs(this.app);

        // Disable x-powered-by Header
        this.app.disable("x-powered-by");

        // Processing
        this.app.use(this.mwRequestStart.bind(this));

        // Parse JSON bodies
        this.app.use(expressBodyParser.json());

        // Install API
        this.app.use("/v1", new ApiV1().router);

        // Install WebSocket API Version
        this.app.use("/ws/v1", new WsApiV1().router);

        // Cleanup request data, send response
        this.app.use(this.mwRequestEnd.bind(this));

        // Catch unmatched requests and respond with appropriate error
        this.app.use(this.mwHandleUnmatched.bind(this));

        // Handle errors 
        this.app.use(this.mwHandleErrors.bind(this));

        // Start listening on configured address and port
        const api = this.config.data.api;
        this.app.listen(api.port, api.host);
        this.log.info("api service has been started on %s:%d", api.host, api.port);
    }

    private mwRequestStart(req: Request, res: Response, next: NextFunction): void {
        /* CORS access control */
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Session-Token");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");

        return next();
    }

    private async mwRequestEnd(req: Request, res: Response, next: NextFunction): Promise<void> {
        if (req.response) {
            if (req.response.body) {
                res.status(req.response.httpStatus).send(req.response.body);
            } else {
                ApiResponse.Error.InternalServerError(next, undefined, "Received response without body at the end of request pipeline");
            }
            this.log.debug("api request [from %s, user %s] %s %s", req.ip, req.user ? req.user.username : "-", req.method, req.path);
            return;
        }
        return next();
    }


    private async mwHandleErrors(err: Error, req: Request, res: Response, next: NextFunction): Promise<void> {
        if (err instanceof ApiError && err.httpStatus !== 500) {
            /* Handle regular errors */
            const internalMessage = err.internalException ? typeof err.internalException === "string" ? err.internalException : err.internalException.message : null;
            this.log.info("api error [from %s, user %s] %s %s: %s%s", req.ip, req.user ? req.user.username : "-", req.method, req.path, err.message, (internalMessage) ? " [internal: " + internalMessage + "]" : "");
            res.status(err.httpStatus).json({
                error: true,
                errorMessage: err.message,
                extra: err.extra ? err.extra : undefined
            });
        } else if (err instanceof SyntaxError) {
            /* Request body parse errors */
            this.log.warn("api request syntax error [from %s, user %s] %s %s: %s", req.ip, req.user ? req.user.username : "-", req.method, req.path, err.message);
            res.status(400).json({
                error: true,
                errorMessage: "bad request",
                extra: {
                    code: "MALFORMED_BODY"
                }
            });
        } else {
            /* Internal programming (server) errors */
            this.log.error("api unexpected exception [from %s, user %s] %s %s", req.ip, req.user ? req.user.username : "-", req.method, req.path, req.path, err.message);
            console.error(err);
            if (err instanceof ApiError && err.internalException) {
                this.log.error(err.internalException);
            }
            res.status(500).json({
                error: true,
                errorMessage: "internal server error"
            });
        }
        return res.end();
    }


    private mwHandleUnmatched(req: Request, res: Response, next: NextFunction): void {
        return ApiResponse.Error.BadRequest(next);
    }

}