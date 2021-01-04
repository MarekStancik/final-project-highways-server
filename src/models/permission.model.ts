import { EntityType } from "./database-object.model";

export type AuthorizationType = "admin" | "user" | "manager" | "techie";

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
        route: ["read"],
        user: ["read","update","create","delete"],
        node: ["read"],
        device: ["read"]
    },
    admin:{
        route: ["create","delete","read","update"],
        user: ["create","delete","read","update"],
        node: ["create","delete","read","update"],
        device: ["create","delete","read","update"]
    },
    techie:{
        route: ["create","delete","read","update"],
        user: [],
        node: ["create","delete","read","update"],
        device: ["create","delete","read","update"]
    }
}
