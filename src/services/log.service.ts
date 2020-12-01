import * as winston from "winston";

export class LogService {

    private logger: winston.Logger;

    private static _instance: LogService;

    public static get instance() : LogService {
        if(!LogService._instance) {
            LogService._instance = new LogService();
        }
        return LogService._instance;
    }

    private constructor() {
        const defaultTextFormat = winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DDTHH:mm:ssZZ" }),
            winston.format.simple(),
            winston.format.splat(),
            winston.format.printf(msg => {
                return `${msg.timestamp} - ` + colorizer.colorize(msg.level, `${msg.level}`) + `: ${msg.originalError?.message || msg.message}`
            }
            )
        );
        const transports: any[] = [
            new winston.transports.Console({
                level: "debug",
                format: defaultTextFormat
            })
        ];
        const colorizer = winston.format.colorize();
        this.logger = winston.createLogger({
            level: "debug",
            transports
        });
        this.logger = winston.createLogger({
            transports
        });
    }

    public silly(msg: string, ...meta: any[]): this {
        return this.log("silly", msg, ...meta);
    }

    public debug(msg: string, ...meta: any[]): this {
        return this.log("debug", msg, ...meta);
    }

    public info(msg: string, ...meta: any[]): this {
        return this.log("info", msg, ...meta);
    }

    public warn(msg: string, ...meta: any[]): this {
        return this.log("warn", msg, ...meta);
    }

    public error(msg: string | Error, ...meta: any[]): this {
        return this.log("error", msg, ...meta);
    }

    public log(level: string, msg: string | Error, ...meta: any[]): this {
        msg = "server " + msg;
        this.logger.log(level, msg as any, ...meta);
        return this;
    }

    public setConsoleLogLevel(level: string): void {
        const transport = this.logger.transports.find(transport => transport instanceof winston.transports.Console);
        if (transport) {
            transport.level = level;
        }
    }
}
