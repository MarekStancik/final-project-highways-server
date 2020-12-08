import { DatabaseObject } from "./database-object.model";
import { User } from "./user.model";

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
    permissions: any;
}

export class UserSpec {
    id: string;
    user: User;
}