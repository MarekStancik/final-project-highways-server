import { EntityType } from "./database-object.model";

export type AuthorizationType = "admin" | "user" | "manager";

export type OperationType = "create" | "read" | "update" | "delete";

export const Permissions: Record<AuthorizationType, Record<EntityType, OperationType[]>> = {
    user:{
        route: ["read"],
        user: [],
        usersession: []
    },
    manager:{
        route: ["read","update","delete","create"],
        user: ["read"],
        usersession: []
    },
    admin:{
        route: ["create","delete","read","update"],
        user: ["create","delete","read","update"],
        usersession: []
    }
}