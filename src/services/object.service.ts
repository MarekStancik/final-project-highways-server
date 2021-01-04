import { DatabaseObject, EntityType } from "../models/database-object.model";
import { DatabaseService } from "./database.service/database.service";
import { EventService } from "./event.service";

export class ObjectService<T extends DatabaseObject> {
    
    constructor(
        protected db: DatabaseService, 
        protected eventBus: EventService, 
        public readonly entityType: EntityType) {

    }

    public list(query?: any): Promise<T[]>{
        return this.db.list<T>(this.entityType,query);
    }

    public async create(obj: T): Promise<T>{
        const newObj = await this.db.create<T>(this.entityType,obj);
        this.eventBus.emit("create",this.entityType,newObj);
        return newObj;
    }

    public async delete(id: string): Promise<T>{
        const obj = await this.db.get<T>(this.entityType,{id});
        if (obj) {
            await this.db.delete<T>(this.entityType,id);
            this.eventBus.emit("delete",this.entityType,obj);
        }
        return obj;
    }

    public async update(obj: T): Promise<T>{
        const updated = await this.db.update(this.entityType,obj);
        this.eventBus.emit("update",this.entityType,obj);
        return updated;
    }
}