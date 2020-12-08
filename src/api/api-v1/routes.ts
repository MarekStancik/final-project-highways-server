import { NextFunction, Request, Response, Router } from "express";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { LogService } from "../../services/log.service";
import { RouteService } from "../../services/route.service/route.service";
import { ApiResponse } from "../utils/api-response";

export class RoutesApi {

    private log: LogService = LogService.instance;

    constructor(
        private auth: AuthenticationService,
        private routeService: RouteService
    ) {

    }

    public install(router: Router): void {
        router.get("/routes", this.auth.mwfRequireAuthentication(), this.auth.mwfRequireAuthorization("route","read"), this.mwList.bind(this));
        router.post("/routes", this.auth.mwfRequireAuthentication(), this.auth.mwfRequireAuthorization("route","create"), this.mwCreate.bind(this));
        router.delete("/routes/:id", this.auth.mwfRequireAuthentication(), this.auth.mwfRequireAuthorization("route","delete"), this.mwDelete.bind(this));
        router.put("/routes/:id",this.auth.mwfRequireAuthentication(),this.auth.mwfRequireAuthorization("route","update"),this.mwUpdate.bind(this));
    }

    public async mwUpdate(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.params?.id) {
                return ApiResponse.Error.BadRequest(next,"id was not provided");
            }
            if(!req.body) {
                return ApiResponse.Error.BadRequest(next,"body was not provided");
            }
            const updatedObj = this.routeService.update(req.body);
            return updatedObj ? ApiResponse.Success.Ok(req,next,updatedObj) : ApiResponse.Error.NotFound(next,`route with id ${req.params.id} does not exist`);
        } catch (err) {
            this.log.error(err);
            return ApiResponse.Error.Conflict(next,err);
        }
    }

    public async mwList(req: Request, res: Response, next: NextFunction) {
        return ApiResponse.Success.Ok(req, next, await this.routeService.list());
    }

    public async mwDelete(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.params?.id) {
                return ApiResponse.Error.BadRequest(next,"id was not provided");
            }
            this.routeService.delete(req.params.id);
            return ApiResponse.Success.Ok(req,next,{});
        } catch (err) {
            this.log.error(err);
            return ApiResponse.Error.Conflict(next,err);
        }
    }

    public mwCreate(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.body) {
                return ApiResponse.Error.BadRequest(next, "body was not provided");
            }
            return ApiResponse.Success.Created(req, next, this.routeService.create(req.body));
        } catch (err) {
            this.log.error(err);
            return ApiResponse.Error.Conflict(next,err);
        }
    }
}