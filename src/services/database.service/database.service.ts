import { DatabaseObject, EntityType } from "../../models/database-object.model";

export abstract class DatabaseService {
    abstract create<T extends DatabaseObject>(type: EntityType,object: T): Promise<T>;
    
    abstract get<T extends DatabaseObject>(type: EntityType, query?: any): Promise<T>;
    
    abstract list<T extends DatabaseObject>(type: EntityType, query?: any): Promise<T[]>;
    
    abstract update<T extends DatabaseObject>(type: EntityType,object: T): Promise<T>;
    
    abstract delete<T extends DatabaseObject>(type: EntityType,id: string): Promise<T>;
    abstract delete<T extends DatabaseObject>(type: EntityType,object: T): Promise<T>;
}