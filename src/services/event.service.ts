import { Observable, Subject } from "rxjs";
import { EntityType } from "../models/database-object.model";
import { ActionType, Event } from "../models/event.model";

export class EventService {
    private bus$: Subject<Event> = new Subject();

    public emit<T>(action: ActionType, entity: EntityType, object: T): void {
        this.bus$.next({
            action,
            objectType: entity,
            object
        })
    }

    public listen(): Observable<Event> {
        return this.bus$.pipe();
    }
}
