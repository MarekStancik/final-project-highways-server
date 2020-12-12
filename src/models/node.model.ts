import { DatabaseObject } from "./database-object.model";
import { Device } from "./device.model";

export class Node extends DatabaseObject{
    name: string;
    location: {
        longitude: string;
        latitude: string;
    };
    devices: Device[];
}