import { Router } from "express";
import { takeUntil, filter, take, tap } from "rxjs/operators";

export class WsApiV1 {

   // private handlers: WsApiClientHandler[] = [];

    public get router(): Router {
        const router = Router();

       /* router.ws("/", (ws, req) => {
            const handler = new WsApiClientHandler(ws, req);
            this.handlers.push(handler);
            handler.state$.pipe(
                takeUntil(handler.close$),
                filter(state => state === "ready"),
                take(1),
                tap(async _ => {
                    await new ClientEventsFeature(handler).initialize();
                })
            ).subscribe();
            handler.state$.pipe(
                filter(state => state === "closed"),
                tap(_ => this.handlers.splice(this.handlers.indexOf(handler), 1))
            ).subscribe();
        }); */

        return router;
    }
}