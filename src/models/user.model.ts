import { DatabaseObject } from "./database-object.model";

export class User extends DatabaseObject{
    _id: string;
    username: string;
    password: string;
    enabled: boolean;
}