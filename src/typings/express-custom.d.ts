/// <reference types="node" />

declare namespace Express {

    export interface RequestResponseHandle {
        httpStatus: number;
        body?: string;
    }

    export interface Request {
        response?: RequestResponseHandle;
        user?: any;
        session?: any;
        permissions: any;
    }
}
