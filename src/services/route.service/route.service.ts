import { BehaviorSubject, Observable } from "rxjs"
import { Route } from "../../models/route.model"

export interface RouteService {
    list(): BehaviorSubject<Route[]>;
    create(route: Route): Route;
}