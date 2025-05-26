import winston from "@utils/winston";

const morganFormat =
    ":method :url :status :res[content-length] - :response-time ms :remote-addr :user-agent";

const morganStream = {
    write: (message: string) => {
        const parts = message.trim().split(" ");
        const status = parseInt(parts[2], 10);

        const log = {
            method: parts[0],
            url: parts[1],
            status: status,
            content_length: parts[3] !== "-" ? parseInt(parts[3], 10) : null,
            response_time: parseFloat(parts[5]),
            ip: parts[6],
            user_agent: parts.slice(7).join(" "),
        };

        // Determine log level based on status code
        if (status >= 500) {
            winston.error(log);
        } else if (status >= 400) {
            winston.warn(log);
        } else if (status >= 300) {
            winston.info(log);
        } else {
            winston.http(log);
        }
    },
};

export { morganFormat, morganStream };
