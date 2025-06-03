import { createClient, RedisClientType } from "redis";
import ENV from "./env";
import printf from "@/scripts/printf";

class RedisConfig {
    private static instance: RedisClientType;

    public static getInstance(): RedisClientType {
        if (!RedisConfig.instance) {
            RedisConfig.instance = createClient({
                url: ENV.REDIS.RATE_LIMIT_DATABASE_URL,
            });
            RedisConfig.instance
                .connect()
                .then(() => {
                    printf.success("~~> Redis connected");
                })
                .catch((err) => {
                    printf.error(`~~> Redis connection failed ${err.message}`);
                    throw new Error(`Redis issue : ${err.message}`);
                });
        }
        return RedisConfig.instance;
    }
}

const redisClient = RedisConfig.getInstance();

export default redisClient;
