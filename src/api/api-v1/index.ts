import { NextFunction, Request, Response, Router } from "express";
import { ApiResponse } from "../utils/api-response";
import { AuthenticationApi } from "./authentication";

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

        return router;
    }
}