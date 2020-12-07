import { BehaviorSubject } from "rxjs";
import { interval, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Route } from "../../models/route.model";
import { RouteService } from "./route.service";
import * as uuid from "uuid";

const arr =
    [
        { id: "001", from: "BB", to: "BA", name: "D1", length: 202, avgTime: 2000, status: "empty" },
        { id: "002", from: "VIE", to: "BA", name: "E50", length: 60, avgTime: 2000, status: "normal" },
        { id: "003", from: "ESB", to: "CPH", name: "E64", length: 400, avgTime: 2000, status: "full" },
        { id: "004", from: "ZV", to: "BB", name: "E64", length: 18, avgTime: 2000, status: "normal" },
        { id: "005", from: "DT", to: "ZV", name: "D1", length: 22, avgTime: 2000, status: "jammed" },
        { id: "006", from: "BA", to: "BRNO", name: "R2", length: 160, avgTime: 2000, status: "empty" },
        { id: "007", from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
        { id: "008", from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "normal" },
        { id: "009", from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "full" }
    ];

export class MockRouteService implements RouteService {

    private subject$ = new BehaviorSubject<Route[]>(null);

    constructor() {
        interval(5000).pipe(
            map(num => arr),
            tap(data => data.forEach(v => v.avgTime = Math.random() * 1000))
        ).subscribe(data => this.subject$.next(data));
    }

    create(route: Route): Route {
        route.id = uuid.v4();
        arr.push(route);
        this.subject$.next(arr);
        return route;
    }

    list(): BehaviorSubject<Route[]> {
        return this.subject$;
    }

}