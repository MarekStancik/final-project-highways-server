import fs from "fs";
import YAML from "yaml";
import { Config } from "../models/config.model";
import { LogService } from "./log.service";

export class ConfigService {
    public data: Config;

    constructor(filename: string) {
        const log = LogService.instance
        try {
            const contents =  fs.readFileSync(filename);
            this.data = YAML.parse(contents.toString());
            log.debug("loaded configuration from " + filename);
        } catch (error) {
            console.log(error)
            log.error(error);
            throw new Error("failed to load config file");
        }
    }
}