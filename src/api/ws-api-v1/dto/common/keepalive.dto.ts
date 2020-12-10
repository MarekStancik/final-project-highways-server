import { MessageBaseDto } from "./message-base.dto";

export interface KeepaliveDto extends MessageBaseDto {
    type: "common.keepalive";
}
