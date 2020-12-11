import { DatabaseObject, EntityType } from "../../models/database-object.model";

export interface DatabaseService {
    create<T extends DatabaseObject>(type: EntityType,object: T): Promise<T>;
    
    get<T extends DatabaseObject>(type: EntityType, query?: any): Promise<T>;
    
    list<T extends DatabaseObject>(type: EntityType, query?: any): Promise<T[]>;
    
    update<T extends DatabaseObject>(type: EntityType,object: T): Promise<T>;
    
    delete<T extends DatabaseObject>(type: EntityType,id: string): Promise<T>;
    delete<T extends DatabaseObject>(type: EntityType,object: T): Promise<T>;
}