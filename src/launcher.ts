import { Container } from "typescript-ioc";
import { ApiService } from "./services/api.service";
import { DatabaseService } from "./services/database.service/database.service";
import { MongoDatabaseService } from "./services/database.service/mongo-database.service";
import { LogService } from "./services/log.service";
import { MockRouteService } from "./services/route.service/mock-route.service";
import { RouteService } from "./services/route.service/route.service";

export class ServerLauncher {

    public async run() : Promise<void> {
        const log = Container.get(LogService)
        try {
            log.info("starting server");

            // Setting up interfaces
            Container.bind(DatabaseService).to(MongoDatabaseService);
            Container.bind(RouteService).to(MockRouteService);

            //Initializing Services
            await Container.get(MongoDatabaseService).initialize();
            Container.get(ApiService).initialize();

            log.info("server bootstrap finished");
        } catch (error) {
            log.error("server startup failed: " + (error.message || "unknown error occurred while initializing server"));
            console.error(error);
            process.exit(1);
        }    
    }

}
