import { NextFunction, Request, Response, Router } from "express";
import { User } from "../../models";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { DatabaseService } from "../../services/database.service/database.service";
import { ObjectService } from "../../services/object.service";
import { RouteService } from "../../services/route.service/route.service";
import { UserService } from "../../services/user.service";
import { ApiResponse } from "../utils/api-response";
import { AuthenticationApi } from "./authentication";
import { ObjectApi } from "./objects";
import { RoutesApi } from "./routes";

export class ApiV1 {

    constructor(
        private auth: AuthenticationService,
        private db: DatabaseService,
        private routes: RouteService,
        private users: UserService
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

        /* Users API */
        new ObjectApi(this.auth,this.users).install(router,"users");

        return router;
    }
}