import { DatabaseObject } from "./database-object.model";
import { AuthorizationType } from "./permission.model";

export class User extends DatabaseObject{
    username: string;
    password: string;
    enabled: boolean;
    authorization: AuthorizationType;
}