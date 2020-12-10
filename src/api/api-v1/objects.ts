import { NextFunction, Request, Response, Router } from "express";
import { DatabaseObject } from "../../models/database-object.model";
import { EntityType } from "../../models/event.model";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { LogService } from "../../services/log.service";
import { ObjectService } from "../../services/object.service";
import { ApiResponse } from "../utils/api-response";

export class ObjectApi<T extends DatabaseObject> {

    private log: LogService = LogService.instance;

    constructor(
        private auth: AuthenticationService,
        private objectService: ObjectService<T>
    ) {

    }

    public install(router: Router,path: string): void {
        const entityType = this.objectService.entityType;
        router.get(`/${path}`, this.auth.mwfRequireAuthentication(), this.auth.mwfRequireAuthorization(entityType,"read"), this.mwList.bind(this));
        router.post(`/${path}`, this.auth.mwfRequireAuthentication(), this.auth.mwfRequireAuthorization(entityType,"create"), this.mwCreate.bind(this));
        router.delete(`/${path}/:id`, this.auth.mwfRequireAuthentication(), this.auth.mwfRequireAuthorization(entityType,"delete"), this.mwDelete.bind(this));
        router.put(`/${path}/:id`,this.auth.mwfRequireAuthentication(),this.auth.mwfRequireAuthorization(entityType,"update"),this.mwUpdate.bind(this));
    }

    public async mwUpdate(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.params?.id) {
                return ApiResponse.Error.BadRequest(next,"id was not provided");
            }
            if(!req.body) {
                return ApiResponse.Error.BadRequest(next,"body was not provided");
            }
            const updatedObj = this.objectService.update(req.body);
            return updatedObj ? ApiResponse.Success.Ok(req,next,updatedObj) : ApiResponse.Error.NotFound(next,`object with id ${req.params.id} does not exist`);
        } catch (err) {
            this.log.error(err);
            return ApiResponse.Error.Conflict(next,err);
        }
    }

    public async mwList(req: Request, res: Response, next: NextFunction) {
        const list = await this.objectService.list();
        console.log(list);
        return ApiResponse.Success.Ok(req, next, list);
    }

    public async mwDelete(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.params?.id) {
                return ApiResponse.Error.BadRequest(next,"id was not provided");
            }
            this.objectService.delete(req.params.id);
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
            return ApiResponse.Success.Created(req, next, this.objectService.create(req.body));
        } catch (err) {
            this.log.error(err);
            return ApiResponse.Error.Conflict(next,err);
        }
    }
}