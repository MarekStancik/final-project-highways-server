import { BehaviorSubject, Observable } from "rxjs";
import { MessageBaseDto } from "../api/ws-api-v1/dto/common";
import { Event, ActionType, EntityType } from "../models/event.model";

export class EventService {


    private bus$: BehaviorSubject<Event> = new BehaviorSubject(null);

    public emit<T>(action: ActionType, entity: EntityType, object: T): void {
        this.bus$.next({
            action,
            objectType: entity,
            object
        })
    }

    // public listen<T>(action: ActionType, entity: EntityType): Observable<T> {

    // }

    public listen(): Observable<Event> {
        return this.bus$.pipe();
    }
}