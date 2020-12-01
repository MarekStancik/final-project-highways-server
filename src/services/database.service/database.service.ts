import { DatabaseObject } from "../../models/database-object.model";

export interface DatabaseService {
    create<T extends DatabaseObject>(type: (new () => T)): Promise<T>;
    get<T extends DatabaseObject>(type: (new () => T), query?: any): Promise<T>;
    list<T extends DatabaseObject>(type: (new () => T), query?: any): Promise<T[]>;
    update<T extends DatabaseObject>(object: T): Promise<T>;
    delete<T extends DatabaseObject>(object: T): Promise<void>;
}