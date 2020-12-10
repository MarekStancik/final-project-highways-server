import { MessageBaseDto } from "../common";

export interface RequestDto extends MessageBaseDto {
    type: "authentication.request";
    sessionToken?: string;
}
