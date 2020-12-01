import { DatabaseService } from "./database.service";
import { Cursor, Db, MongoClient } from "mongodb";
import { LogService } from "./log.service";
import { timer } from "rxjs/internal/observable/timer";
import { first } from "rxjs/operators";

export class MongoDatabaseService implements DatabaseService {

    private client: MongoClient;
    private log: LogService = LogService.instance

    constructor({host, port} : {host: string, port: number}) {
        const url = `mongodb://${host}:${port}`;

        const boot = async () => {
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

        boot();
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