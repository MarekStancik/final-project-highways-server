import { NextFunction, Request } from "express";
import { ApiError } from "./api.error";

export class ApiResponse {
    public static Error = {
        BadRequest: ApiResponse.createErrorFunction(400, "Bad Request"),
        Unauthorized: ApiResponse.createErrorFunction(401, "Unauthorized"),
        PermissionDenied: ApiResponse.createErrorFunction(403, "Permission Denied"),
        UnsupportedUserAgentVersion: ApiResponse.createErrorFunction(403, "Unsupported Client Version"),
        NotFound: ApiResponse.createErrorFunction(404, "Not Found"),
        Conflict: ApiResponse.createErrorFunction(409, "Conflict"),
        InternalServerError: ApiResponse.createErrorFunction(500, "Internal Server Error"),
        NotImplemented: ApiResponse.createErrorFunction(501, "Not Yet Implemented"),
        ServiceUnavailable: ApiResponse.createErrorFunction(503, "Service Unavailable")
    };

    public static Success = {
        Ok: ApiResponse.createResponseFunction(200),
        Created: ApiResponse.createResponseFunction(201),
        NotModified: ApiResponse.createResponseFunction(304)
    };

    private static createResponseFunction(httpStatus: number) {
        return (req: Request, next: NextFunction, body: any) => {
            req.response = { httpStatus, body };
            return next();
        };
    }

    private static createErrorFunction(httpStatus: number, defaultMessage: string) {
        return (next: NextFunction, userMessage?: any, internalMessage?: any, extra?: any) => {
            return next(new ApiError(userMessage || defaultMessage, httpStatus, internalMessage, extra));
        };
    }
}