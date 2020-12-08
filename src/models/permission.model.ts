export type ResourceType = "user" | "route";

export type AuthorizationType = "admin" | "user" | "manager";

export type OperationType = "create" | "read" | "update" | "delete";

export const Permissions: Record<AuthorizationType, Record<ResourceType, OperationType[]>> = {
    user:{
        route: ["read"],
        user: []
    },
    manager:{
        route: ["read","update","delete","create"],
        user: ["read"]
    },
    admin:{
        route: ["create","delete","read","update"],
        user: ["create","delete","read","update"]
    }
}