import { BehaviorSubject } from "rxjs"
import { Route } from "../../models/route.model"

export interface RouteService {
    list(): BehaviorSubject<Route[]>;
}