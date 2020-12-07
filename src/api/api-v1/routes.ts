import { NextFunction, Request, Response, Router } from "express";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { LogService } from "../../services/log.service";
import { RouteService } from "../../services/route.service/route.service";
import { ApiResponse } from "../utils/api-response";

export class RoutesApi {

    private log: LogService = LogService.instance;

    constructor(
        private authenticationService: AuthenticationService,
        private routeService: RouteService
    ) {

    }

    public install(router: Router): void {
        router.get("/routes", this.authenticationService.mwfRequireAuthentication(), this.mwList.bind(this));
        router.post("/routes", this.authenticationService.mwfRequireAuthentication(), this.mwCreate.bind(this));
    }

    public async mwList(req: Request, res: Response, next: NextFunction) {
        return ApiResponse.Success.Ok(req, next, await this.routeService.list());
    }

    public mwCreate(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.body) {
                return ApiResponse.Error.BadRequest(next);
            }
            return ApiResponse.Success.Created(req, next, this.routeService.create(req.body));
        } catch (err) {
            this.log.error(err);
            return ApiResponse.Error.Conflict(next,err);
        }
    }
}