import { NextFunction, Request, Response, Router } from "express";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { LogService } from "../../services/log.service";
import { ApiResponse } from "../utils/api-response";

export class RoutesApi {

    private log: LogService = LogService.instance;

    constructor(
        private authenticationService: AuthenticationService
    ) {

    }

    public install(router: Router): void {
        router.get("/routes", this.authenticationService.mwfRequireAuthentication(), this.mwGetAll.bind(this));
    }

    public mwGetAll(req: Request, res: Response, next: NextFunction) {
        return ApiResponse.Success.Ok(req, next, [{ from: "BB", to: "BA", name: "D1", length: 202, avgTime: 2000, status: "empty" },
        { from: "VIE", to: "BA", name: "E50", length: 60, avgTime: 2000, status: "normal" },
        { from: "ESB", to: "CPH", name: "E64", length: 400, avgTime: 2000, status: "full" },
        { from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "normal" },
        { from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "jammed" },
        { from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
        { from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
        { from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
        { from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },])
    }
}