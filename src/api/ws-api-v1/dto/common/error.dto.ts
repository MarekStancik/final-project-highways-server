import { MessageBaseDto } from "./message-base.dto";

export interface ErrorMessageDto extends MessageBaseDto {
    type: "common.error";
    errorMessage: string;
    errorCode?: string | number;
}
