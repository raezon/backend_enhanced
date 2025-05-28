import { morganFormat, morganStream } from "@config/morgan";
import express, { Application } from "express";
import { RedisStore } from "rate-limit-redis";
import rateLimit from "express-rate-limit";
import { rateLimitRedis } from "./redis";
import { setupSwagger } from "./swagger";
import helmet from "helmet";
import morgan from "morgan";
import ENV from "./env";
import cors from "cors";
import cookieParser from "cookie-parser";

const createApp = async (): Promise<Application> => {
    const App: Application = express();

    if (ENV.NODE_ENV !== "test") {
        try {
            const redisInstance = await rateLimitRedis;
            const redisClient: any = redisInstance?.client ?? {
                sendCommand: () => Promise.resolve([]),
            };

            App.use(
                rateLimit({
                    windowMs: 60 * 1000,
                    limit: 100,
                    standardHeaders: "draft-8",
                    legacyHeaders: true,
                    store: new RedisStore({
                        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
                    }),
                    skip: (req, _res) => {
                        return (
                            req.method === "OPTIONS" ||
                            req.path === "/api-docs" ||
                            req.path === "/api-docs.json" ||
                            req.path === "/health"
                        );
                    },
                })
            );
        } catch (error) {
            console.log("Skipping Redis rate limiting due to an error.");
        }
    }

    App.use(morgan(morganFormat, { stream: morganStream }));
    App.use(cookieParser());
    App.use(express.urlencoded({ extended: true }));
    App.use(express.static("public"));
    App.use(express.json());
    App.use(helmet());
    App.use(
        cors({
            origin: function (origin, callback) {
                // Allow requests with no origin (mobile apps, Postman, etc.)
                if (!origin) return callback(null, true);

                // Allow localhost for development
                if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
                    return callback(null, true);
                }

                // Add your production frontend domains here
                const allowedOrigins = [
                    "https://your-production-domain.com",
                    "https://your-staging-domain.com",
                ];

                if (allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }

                // For development, you might want to allow all origins temporarily
                if (ENV.NODE_ENV === "development") {
                    return callback(null, true);
                }

                callback(new Error("Not allowed by CORS"));
            },
            credentials: true,
            allowedHeaders: [ENV.TOKEN_HIDEOUT, "Content-Type", "Authorization"],
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        })
    );

    setupSwagger(App, "/api-docs");

    return App;
};

const AppPromise = createApp();
export default AppPromise;
