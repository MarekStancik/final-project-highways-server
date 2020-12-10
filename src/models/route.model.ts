import { DatabaseObject } from "./database-object.model";

export type RouteStatus = "empty" | "normal" | "full" | "jammed";

export class Route extends DatabaseObject{
    start: string;
    end: string;
    name: string;
    length :number;
    avgTime: number;
    status: RouteStatus;
}