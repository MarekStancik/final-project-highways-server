export interface DatabaseService {
    create<T>(type: (new () => T)): T;
    get<T>(type: (new () => T), query?: any): T;
    list<T>(type: (new () => T), query?: any): T[];
    update<T>(object: T): T;
    delete<T>(object: T): T;
}