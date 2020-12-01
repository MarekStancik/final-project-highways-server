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

    create<T>(type: new () => T): T {
        throw new Error("Method not implemented.");
    }
    get<T>(type: new () => T, query?: any): T {
        throw new Error("Method not implemented.");
    }
    list<T>(type: new () => T, query?: any): T[] {
        throw new Error("Method not implemented.");
    }
    update<T>(object: T): T {
        throw new Error("Method not implemented.");
    }
    delete<T>(object: T): T {
        throw new Error("Method not implemented.");
    }

}