import { EntityType } from "./database-object.model";

export type ActionType = "update" | "create" | "delete";

export interface Event {
    action: ActionType;
    objectType: EntityType;
    object: any;
}