import { NextFunction, Request, Response, Router } from "express";
import { Container } from "typescript-ioc";
import { ObjectService } from "../../services/object.service";
import { RouteService } from "../../services/route.service/route.service";
import { UserService } from "../../services/user.service";
import { ApiResponse } from "../utils/api-response";
import { AuthenticationApi } from "./authentication";
import { ObjectApi } from "./objects";

export class ApiV1 {

    public get router(): Router {
        const router = Router();

        router.get("/", (req: Request, res: Response, next: NextFunction) => {
            return ApiResponse.Success.Ok(req, next, {
                apiVersion: 1,
                available: true,
            });
        });

        /* Authentication API */
        new AuthenticationApi().install(router);

        /* Routes API */
        new ObjectApi(Container.get(RouteService)).install(router,"routes");

        /* Users API */
        new ObjectApi(Container.get(UserService)).install(router,"users");

        /* Node API */
        new ObjectApi(new ObjectService("node")).install(router,"nodes");
        
        /* Device API */
        new ObjectApi(new ObjectService("device")).install(router,"devices");

        return router;
    }
}
