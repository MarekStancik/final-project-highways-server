import fs from "fs";
import { Container, OnlyInstantiableByContainer, Singleton } from "typescript-ioc";
import YAML from "yaml";
import { Config } from "../models/config.model";
import { LogService } from "./log.service";

@Singleton
@OnlyInstantiableByContainer
export class ConfigService {
    public data: Config;

    constructor() {
        const filename = "./config.yaml";
        const log = Container.get(LogService)
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