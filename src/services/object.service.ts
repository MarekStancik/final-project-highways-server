// export interface IObjectService<T> {
//     list(): T[];
//     create(obj: T): T;
//     delete(id: string): T;
//     update(obj: T): T;
// }

import { DatabaseObject } from "../models/database-object.model";
import { EntityType } from "../models/event.model";
import { DatabaseService } from "./database.service/database.service";
import { EventService } from "./event.service";

export class ObjectService<T extends DatabaseObject> {
    
    constructor(
        private db: DatabaseService, 
        private eventBus: EventService,
        private dataObjectClass: { new(): T}, 
        public readonly entityType: EntityType) {

    }

    public list(query?: any): Promise<T[]>{
        return this.db.list(this.dataObjectClass,query);
    }

    public async create(obj: T): Promise<T>{
        const newObj = await this.db.create(obj);
        this.eventBus.emit("create",this.entityType,newObj);
        return newObj;
    }

    public async delete(id: string): Promise<T>{
        const obj = await this.db.get(this.dataObjectClass,{id});
        if (obj) {
            await this.db.delete(this.dataObjectClass,id);
            this.eventBus.emit("delete",this.entityType,obj);
        }
        return obj;
    }

    public async update(obj: T): Promise<T>{
        const updated = await this.db.update(obj);
        this.eventBus.emit("update",this.entityType,obj);
        return updated;
    }
}