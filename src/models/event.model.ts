export type ActionType = "update" | "create" | "delete";

export type EntityType = "user" | "route";

export interface Event {
    action: ActionType;
    objectType: EntityType;
    object: any;
}