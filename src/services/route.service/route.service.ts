import { BehaviorSubject, Observable } from "rxjs"
import { Route } from "../../models/route.model"

export interface RouteService {
    list(): Route[];
    create(route: Route): Route;
    delete(id: string): Route;
    update(route: Route): Route;
}