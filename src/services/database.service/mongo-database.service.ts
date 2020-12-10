import { DatabaseService } from "./database.service";
import { Collection, Cursor, Db, MongoClient } from "mongodb";
import { timer } from "rxjs/internal/observable/timer";
import { first } from "rxjs/operators";
import { ConfigService } from "../config.service";
import { LogService } from "../log.service";
import { DatabaseObject } from "../../models/database-object.model";
import { type } from "os";

export class MongoDatabaseService implements DatabaseService {

    private client: MongoClient;
    private log: LogService = LogService.instance

    constructor(private config: ConfigService) {
        
    }

    public async initialize() : Promise<void> {
        const {host,port} = this.config.data.db;
        const url = `mongodb://${host}:${port}`;
        while (!this.client) {
            try {
                this.client = await MongoClient.connect(
                    url,
                    {
                        useUnifiedTopology: true
                    }
                );
            } catch (error) {
                this.log.warn("mongo connection failed: %s", error.message);
                await timer(5000).pipe(first()).toPromise();
            }
        }
        this.log.info("connected to database service (mongo) at %s:%d", host, port);
    }

    private get database(): Db {
        return this.client.db("mydatabase");
    }

    public create<T extends DatabaseObject>(object: T): Promise<T>;
    public create<T extends DatabaseObject>(type: (new () => T)): Promise<T>;
    public async create<T extends DatabaseObject>(type?: new () => T,object?: T): Promise<T> {
        if (!object) {
            object = new type();
        }
        await this.collection(type).insertOne(object);
        return object;
    }

    public async get<T extends DatabaseObject>(type: new () => T, query?: any): Promise<T> {
        const list = await this.list(type,query);
        if (list.length > 1) {
            throw Error("bad query");
        }
        return list[0] || null;
    }

    public async list<T extends DatabaseObject>(type: new () => T, query?: any): Promise<T[]> {
        return await this.collection(type).find(this.buildQuery(query)).toArray();
    }

    public async update<T extends DatabaseObject>(object: T): Promise<T> {
        await this.collection(object).updateOne({ _id: object._id},{ $set: object});
        return object;
    }
    
    public delete<T extends DatabaseObject>(type: (new () => T),id: string): Promise<T>;
    public delete<T extends DatabaseObject>(object: T): Promise<T>;
    public async delete<T extends DatabaseObject>(typeOrObject: T | (new () => T),id?: string): Promise<void>{
        const _id = id ? id : (typeOrObject as T)._id;
        await this.collection(typeOrObject).deleteOne({ _id });

    }

    private collection<T>(x: T) : Collection<any>;
    private collection<T>(x: new () => T) : Collection<any> {
        const collectionName = x.name ? x.name : x.constructor.name;
        return this.database.collection(collectionName.toLowerCase());
    }

    private buildQuery(query: any): any {
        if(query && query.id) {
            const q = Object.assign({_id: query.id}, query);
            delete q.id;
            return q;
        }
        return query;
    }

}