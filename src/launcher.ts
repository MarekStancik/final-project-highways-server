import { ApiService } from "./services/api.service";
import { ConfigService } from "./services/config.service";
import { LogService } from "./services/log.service";

export class ServerLauncher {

    private log: LogService;
    
    constructor(){
        this.log = LogService.instance
    }

    public run() : void {
        try {
            this.log.info("starting server");

            const configService = new ConfigService("./config.yaml");
            const apiService = new ApiService(configService);
            apiService.initialize();

            this.log.info("server bootstrap finished");
        } catch (error) {
            this.log.error("server startup failed: " + (error.message || "unknown error occurred while initializing server"));
            console.error(error);
            process.exit(1);
        }    
    }

}