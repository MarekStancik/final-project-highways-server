export class ApiError extends Error {

    public httpStatus: number;
    public internalException: any;
    public extra: any;

    constructor(message: string, httpStatus: number, internalMessage?: any, extra?: any) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.httpStatus = httpStatus;
        this.internalException = internalMessage;
        this.extra = extra;
    }
}
