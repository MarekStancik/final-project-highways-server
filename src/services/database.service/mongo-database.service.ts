import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import { timer } from "rxjs/internal/observable/timer";
import { first } from "rxjs/operators";
import { Singleton, OnlyInstantiableByContainer, Inject } from "typescript-ioc";
import { DatabaseObject, EntityType } from "../../models/database-object.model";
import { ConfigService } from "../config.service";
import { LogService } from "../log.service";
import { DatabaseService } from "./database.service";

@Singleton
@OnlyInstantiableByContainer
export class MongoDatabaseService extends DatabaseService {

    private client: MongoClient;
    @Inject private log: LogService;
    @Inject private config: ConfigService

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

    public async create<T extends DatabaseObject>(type: EntityType,object: T): Promise<T> {
        await this.collection(type).insertOne(object);
        return this.switchId(object);
    }

    public async get<T extends DatabaseObject>(type: EntityType, query?: any): Promise<T> {
        const list = await this.list(type,query);
        if (list.length > 1) {
            throw Error("bad query");
        }
        return (list[0] || null) as T;
    }

    public async list<T extends DatabaseObject>(type: EntityType, query?: any): Promise<T[]> {
        const list = await this.collection(type).find(this.buildQuery(query)).toArray();
        list.forEach(obj => this.switchId(obj));
        return list;
    }

    public async update<T extends DatabaseObject>(type: EntityType,object: T): Promise<T> {
        await this.collection(type).updateOne(this.buildQuery({ id: object.id}),{ $set: object});
        return object;
    }
    
    public delete<T extends DatabaseObject>(type: EntityType,id: string): Promise<T>;
    public delete<T extends DatabaseObject>(type: EntityType,object: T): Promise<T>;
    public async delete<T extends DatabaseObject>(type: EntityType,idOrObj?: string | T): Promise<void>{
        const id = typeof idOrObj === "string" ? idOrObj : (idOrObj as T).id;
        await this.collection(type).deleteOne(this.buildQuery({ id }));

    }

    private collection(x: EntityType) : Collection<any> {
        return this.database.collection(x);
    }

    private switchId(obj: any): any {
        obj.id = obj._id;
        delete obj._id;
        return obj;
    }

    private buildQuery(query: any): any {
        if(query && query.id) {
            const q = Object.assign({_id: new ObjectId(query.id)}, query);
            delete q.id;
            return q;
        }
        if(query?._id) {
            query._id = new ObjectId(query._id);
        }
        return query;
    }

}