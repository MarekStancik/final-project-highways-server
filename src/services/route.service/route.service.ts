import { Route } from "../../models/route.model"

export abstract class RouteService {
    abstract list(query?: any): Route[];
    abstract create(route: Route): Route;
    abstract delete(id: string): Route;
    abstract update(route: Route): Route;
}