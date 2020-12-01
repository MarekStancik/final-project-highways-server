import { DatabaseService } from "./database.service";
import { Cursor, Db, MongoClient } from "mongodb";
import { LogService } from "./log.service";
import { timer } from "rxjs/internal/observable/timer";
import { first } from "rxjs/operators";
import { ConfigService } from "./config.service";

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

    public async create<T>(type: new () => T): Promise<T> {
        const object: T = new type();
        await this.database.collection(type.name.toLowerCase()).insertOne(object);
        return object;
    }

    public async get<T>(type: new () => T, query?: any): Promise<T> {
        const list = await this.list(type,query);
        if (list.length > 1) {
            throw Error("bad query");
        }
        return list[0] || null;
    }

    public async list<T>(type: new () => T, query?: any): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    public async update<T>(object: T): Promise<T> {
        throw new Error("Method not implemented.");
    }
    
    public async delete<T>(object: T): Promise<T> {
        throw new Error("Method not implemented.");
    }

}