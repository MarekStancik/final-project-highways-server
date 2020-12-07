import { NextFunction, Request, Response, Router } from "express";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { DatabaseService } from "../../services/database.service/database.service";
import { RouteService } from "../../services/route.service/route.service";
import { ApiResponse } from "../utils/api-response";
import { AuthenticationApi } from "./authentication";
import { RoutesApi } from "./routes";

export class ApiV1 {

    constructor(
        private auth: AuthenticationService,
        private db: DatabaseService,
        private routes: RouteService
    ) { }

    public get router(): Router {
        const router = Router();

        router.get("/", (req: Request, res: Response, next: NextFunction) => {
            return ApiResponse.Success.Ok(req, next, {
                apiVersion: 1,
                available: true,
            });
        });

        /* Authentication API */
        new AuthenticationApi(this.auth, this.db).install(router);

        /* Routes API */
        new RoutesApi(this.auth, this.routes).install(router);

        return router;
    }
}