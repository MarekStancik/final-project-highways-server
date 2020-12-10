import { User } from "./models";
import { ApiService } from "./services/api.service";
import { AuthenticationService } from "./services/authentication.service/authentication.service";
import { ConfigService } from "./services/config.service";
import { MongoDatabaseService } from "./services/database.service/mongo-database.service";
import { EventService } from "./services/event.service";
import { LogService } from "./services/log.service";
import { ObjectService } from "./services/object.service";
import { MockRouteService } from "./services/route.service/mock-route.service";

export class ServerLauncher {

    private log: LogService;
    
    constructor(){
        this.log = LogService.instance
    }

    public async run() : Promise<void> {
        try {
            this.log.info("starting server");

            const configService = new ConfigService("./config.yaml");
            const dbService = new MongoDatabaseService(configService);
            const authService = new AuthenticationService(dbService);
            const eventService = new EventService();
            const routeService = new MockRouteService(eventService);
            const userService = new ObjectService(dbService,eventService,User,"user");
            const apiService = new ApiService(configService,dbService,authService,routeService,eventService,userService);

            await dbService.initialize();
            apiService.initialize();

            this.log.info("server bootstrap finished");
        } catch (error) {
            this.log.error("server startup failed: " + (error.message || "unknown error occurred while initializing server"));
            console.error(error);
            process.exit(1);
        }    
    }

}