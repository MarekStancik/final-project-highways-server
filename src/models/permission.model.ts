import { EntityType } from "./database-object.model";

export type AuthorizationType = "admin" | "user" | "manager";

export type OperationType = "create" | "read" | "update" | "delete";

export type ResourceType = Exclude<EntityType, "session">;

export const Permissions: Record<AuthorizationType, Record<ResourceType, OperationType[]>> = {
    user:{
        route: ["read"],
        user: [],
        node: [],
        device: []
    },
    manager:{
        route: ["read","update","delete","create"],
        user: ["read"],
        node: [],
        device: []
    },
    admin:{
        route: ["create","delete","read","update"],
        user: ["create","delete","read","update"],
        node: ["create","delete","read","update"],
        device: ["create","delete","read","update"]
    }
}