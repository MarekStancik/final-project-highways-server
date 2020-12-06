import { Router } from "express";
import { Observable } from "rx";
import { interval } from "rxjs";
import { takeUntil, filter, take, tap, map } from "rxjs/operators";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { DatabaseService } from "../../services/database.service/database.service";
import { RouteService } from "../../services/route.service/route.service";


export class WsApiV1 {

    constructor(private auth: AuthenticationService, private routeService: RouteService) { }

    public get router(): Router {
        const router = Router();

        router.ws("/", (ws, req) => {
            const obs = this.routeService.list().subscribe(data => ws.send(JSON.stringify(data)));
            ws.onclose = e => obs.unsubscribe();
        });

        return router;
    }
}