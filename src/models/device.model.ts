import { DatabaseObject } from "./database-object.model";

export class Device extends DatabaseObject{
    state: "active" | "inactive";
    ipAddress: string;
}