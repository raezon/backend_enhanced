import winston from "winston";
import ENV from "@config/env";

const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const logger = winston.createLogger({
    level: "http",
    levels: logLevels,
    silent: ENV.NODE_ENV === "test",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        winston.format.json()
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
