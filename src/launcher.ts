import { ApiService } from "./services/api.service";
import { LogService } from "./services/log.service";

export class ServerLauncher {

    private log: LogService;

    constructor(){
        this.log = new LogService();
    }

    public async run() : Promise<void> {
        try {
            this.log.info("starting server");

            const apiService = new ApiService(this.log);
            apiService.initialize({
                address: "",
                port: 8080
            });

            this.log.info("server bootstrap finished");
        } catch (error) {
            this.log.error("server startup failed: " + (error.message || "unknown error occurred while initializing server"));
            console.error(error);
            process.exit(1);
        }    
    }

}