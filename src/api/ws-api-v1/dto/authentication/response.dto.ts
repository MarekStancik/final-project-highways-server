import { MessageBaseDto } from "../common";

export interface ResponseDto extends MessageBaseDto {
    type: "authentication.response";
    status: "ok";
}
