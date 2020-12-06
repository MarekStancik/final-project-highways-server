import { BehaviorSubject } from "rxjs";
import { interval, Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Route } from "../../models/route.model";
import { RouteService } from "./route.service";

const arr = [{ from: "BB", to: "BA", name: "D1", length: 202, avgTime: 2000, status: "empty" },
{ from: "VIE", to: "BA", name: "E50", length: 60, avgTime: 2000, status: "normal" },
{ from: "ESB", to: "CPH", name: "E64", length: 400, avgTime: 2000, status: "full" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "normal" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "jammed" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },
{ from: "BB", to: "BA", name: "E64", length: 20, avgTime: 2000, status: "empty" },];

export class MockRouteService implements RouteService {

    private subject$ = new BehaviorSubject<Route[]>(null);

    constructor() {
        interval(5000).pipe(
            map(num => arr),
            tap(data => data.forEach(v => v.avgTime = Math.random() * 1000))
        ).subscribe(data => this.subject$.next(data));
    }

    list(): BehaviorSubject<Route[]> {
        return this.subject$;
    }

}