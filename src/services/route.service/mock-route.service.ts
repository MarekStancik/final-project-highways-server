import { BehaviorSubject } from "rxjs";
import { interval, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Route, RouteStatus } from "../../models/route.model";
import { RouteService } from "./route.service";
import * as uuid from "uuid";
import { EventService } from "../event.service";

const AVG_TIME_MAX = 1000;

export class MockRouteService implements RouteService {

    private arr: Route[] =
        [
            { id: "001", start: "BB", end: "BA", name: "D1", length: 202, avgTime: 2000, status: "empty" },
            { id: "002", start: "VIE", end: "BA", name: "E50", length: 60, avgTime: 2000, status: "normal" },
            { id: "003", start: "ESB", end: "CPH", name: "E64", length: 400, avgTime: 2000, status: "full" },
            { id: "004", start: "ZV", end: "BB", name: "E64", length: 18, avgTime: 2000, status: "normal" },
            { id: "005", start: "DT", end: "ZV", name: "D1", length: 22, avgTime: 2000, status: "jammed" },
            { id: "006", start: "BA", end: "BRNO", name: "R2", length: 160, avgTime: 2000, status: "empty" },
            { id: "007", start: "BB", end: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
            { id: "008", start: "BB", end: "BA", name: "E64", length: 20, avgTime: 2000, status: "normal" },
            { id: "009", start: "BB", end: "BA", name: "E64", length: 20, avgTime: 2000, status: "full" }
        ];

    private subject$ = new BehaviorSubject<Route[]>(this.arr);

    constructor(private eventBus: EventService) {        
        this.arr.forEach(r => this.decorateRoute(r));
        interval(2500).pipe(
            map(num => this.arr[Math.round(Math.random() * (this.arr.length - 1))]),
            tap(obj => this.decorateRoute(obj)),
        ).subscribe(obj => this.eventBus.emit("update","route",obj));
    }

    public update(route: Route): Route {
        const idx = this.arr.findIndex(r => r.id === route.id);
        if (~idx) {
            this.arr[idx] = this.decorateRoute(route);
            this.eventBus.emit("update","route",route);
        }
        return ~idx ? this.arr[idx] : null;
    }

    public delete(id: string): Route {
        const index = this.arr.findIndex(r => r.id === id);
        if (~index) {
            const removed = this.arr.splice(index, 1)[0];
            this.eventBus.emit("delete","route",removed);
            return removed;
        }
        return null;
    }

    public create(route: Route): Route {
        route.id = uuid.v4();
        this.arr.push(this.decorateRoute(route));
        this.eventBus.emit("create","route",route);
        return route;
    }

    public list(): Route[] {
        return this.subject$.value;
    }

    private decorateRoute(route: Route) : Route {
        const statusArr: RouteStatus[] = ["empty","normal","full","jammed"];
        route.avgTime = Math.random() * AVG_TIME_MAX;
        route.status = statusArr[Math.floor(route.avgTime/(AVG_TIME_MAX/4))];
        return route;
    }
}