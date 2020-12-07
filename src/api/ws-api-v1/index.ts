import { Router } from "express";
import { Observable } from "rx";
import { interval } from "rxjs";
import { takeUntil, filter, take, tap, map } from "rxjs/operators";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { DatabaseService } from "../../services/database.service/database.service";
import { LogService } from "../../services/log.service";
import { RouteService } from "../../services/route.service/route.service";


export class WsApiV1 {

    private log = LogService.instance;

    constructor(private auth: AuthenticationService, private routeService: RouteService) { }

    public get router(): Router {
        const router = Router();

        router.ws("/", (ws, req) => {
            const obs = this.routeService.list().subscribe(data => ws.send(JSON.stringify(data)));
            ws.onclose = e => obs.unsubscribe();
            ws.onerror = e => this.log.debug("Websocket Failed", e);
        });

        return router;
    }
}