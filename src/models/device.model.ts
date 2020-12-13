import { DatabaseObject } from "./database-object.model";

export class Device extends DatabaseObject{
    name: string;
    state: "active" | "inactive";
    ipAddress: string;
}