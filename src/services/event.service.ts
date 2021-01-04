import { Observable, Subject } from "rxjs";
import { Singleton, OnlyInstantiableByContainer } from "typescript-ioc";
import { EntityType } from "../models/database-object.model";
import { ActionType, Event } from "../models/event.model";

@Singleton
@OnlyInstantiableByContainer
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
