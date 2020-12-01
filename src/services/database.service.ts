export interface DatabaseService {
    create<T>(type: (new () => T)): Promise<T>;
    get<T>(type: (new () => T), query?: any): Promise<T>;
    list<T>(type: (new () => T), query?: any): Promise<T[]>;
    update<T>(object: T): Promise<T>;
    delete<T>(object: T): Promise<T>;
}