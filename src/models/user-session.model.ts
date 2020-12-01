import { DatabaseObject } from "./database-object.model";

export class UserSession extends DatabaseObject{
    user: UserSpec;
    token: string;
    type: string;
    lifetime: number;
    startDate: Date;
    lastRequestDate: Date;
    expiryDate: Date;
    createDate: Date;
    updateDate: Date;
}

export class UserSpec {
    id: string
}