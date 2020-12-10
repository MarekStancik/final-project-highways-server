import { Route } from "../../models/route.model"

export interface RouteService {
    list(query?: any): Route[];
    create(route: Route): Route;
    delete(id: string): Route;
    update(route: Route): Route;
}