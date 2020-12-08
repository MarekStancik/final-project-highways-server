import { BehaviorSubject } from "rxjs";
import { interval, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Route, RouteStatus } from "../../models/route.model";
import { RouteService } from "./route.service";
import * as uuid from "uuid";
import { remove } from "winston";



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

    private subject$ = new BehaviorSubject<Route[]>(null);

    constructor() {
        const statusArr: RouteStatus[] = ["jammed","empty","full","normal"];
        interval(5000).pipe(
            map(num => this.arr),
            tap(data => data.forEach(v => v.avgTime = Math.random() * 1000)),
            tap(data => data.forEach(v => v.status = statusArr[Math.round(Math.random() * 3)]))
        ).subscribe(data => this.subject$.next(data));
    }

    update(route: Route): Route {
        const idx = this.arr.findIndex(r => r.id === route.id);
        if (~idx) {
            this.arr[idx] = route;
            this.subject$.next(this.arr);
        }
        return ~idx ? this.arr[idx] : null;
    }

    delete(id: string): Route {
        const index = this.arr.findIndex(r => r.id === id);
        if (~index) {
            const removed = this.arr.splice(index, 1)[0];
            this.subject$.next(this.arr);
            return removed;
        }
        return null;
    }

    create(route: Route): Route {
        route.id = uuid.v4();
        this.arr.push(route);
        this.subject$.next(this.arr);
        return route;
    }

    list(): BehaviorSubject<Route[]> {
        return this.subject$;
    }

}