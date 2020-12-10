import { ActionType, EntityType, Event } from "../../../models/event.model";
import { MessageBaseDto } from "./common";

export interface EventMessage extends MessageBaseDto, Event {
    type: "event";
    sequenceId?: string;
}