import * as Authentication from "./authentication";
import * as Common from "./common";
import * as ErrorCodes from "./error-codes";
import { EventMessage } from "./event-message";

export type Message =
    Common.ErrorMessageDto | Common.KeepaliveDto |
    Authentication.RequestDto | Authentication.ResponseDto |
    EventMessage;

export type MessageStub<M extends Message> = Omit<M, "sequenceId"> & Partial<Pick<M, "sequenceId">>;

export { Common, Authentication, ErrorCodes };
