import { Router } from "express";
import { Observable } from "rx";
import { interval } from "rxjs";
import { takeUntil, filter, take, tap, map } from "rxjs/operators";
import { AuthenticationService } from "../../services/authentication.service/authentication.service";
import { DatabaseService } from "../../services/database.service/database.service";

type Record = {
    from: string;
    to: string;
    name: string;
    length :number;
    avgTime: number;
    status: string;
}

const arr = [{ from: "BB", to: "BA", name: "D1", length: 202, avgTime: 2000, status: "empty" },
{ from: "VIE", to: "BA", name: "E50", length: 60, avgTime: 2000, status: "normal" },
{ from: "ESB", to: "CPH", name: "E64", length: 400, avgTime: 2000, status: "full" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "normal" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "jammed" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },];

export class WsApiV1 {
    private obs$ = interval(5000).pipe(
    //    tap(_ => this.shuffleArray(arr)),
        map(num => arr),
        tap(data => data.forEach(v => v.avgTime = Math.random() * 1000))
    );

    constructor(private auth: AuthenticationService, private db: DatabaseService) { }

    public get router(): Router {
        const router = Router();

        router.ws("/", (ws, req) => {
            const obs = this.obs$.subscribe(data => ws.send(JSON.stringify(data)));
            ws.onclose = e => obs.unsubscribe()
            // ws.on("message", data => {
            //     try {
            //         const parsed = JSON.parse(data.toString());
            //         this.internalReceive$.next(parsed);
            //         this.lastActivity = new Date();
            //     } catch (error) {
            //         this.internalReceive$.error(new WsApiError("Failed to parse incoming message", ErrorCodes.MessageParseFailed));
            //     }
            // })
        });

        return router;
    }

    shuffleArray(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}


// const handler = new WsApiClientHandler(ws, req, this.auth, this.db);
            // this.handlers.push(handler);
            // handler.state$.pipe(
            //     takeUntil(handler.close$),
            //     filter(state => state === "ready"),
            //     take(1),
            //     tap(async _ => {
            //         await new ClientEventsFeature(handler).initialize();
            //     })
            // ).subscribe();
            // handler.state$.pipe(
            //     filter(state => state === "closed"),
            //     tap(_ => this.handlers.splice(this.handlers.indexOf(handler), 1))
            // ).subscribe();