import { createClient, RedisClientType } from "redis";
import ENV from "@config/env";

export class RedisSingleton {
    private static instances: Map<string, Promise<RedisSingleton>> = new Map();
    private readonly _client: RedisClientType;

    private constructor(url: string) {
        this._client = createClient({ url });
        this._client.on("error", (err) => console.error("Redis Error:", err));
    }

    private async connect(): Promise<void> {
        try {
            if (!this._client.isOpen) {
                await this._client.connect();
                console.log("Connected to Redis successfully.");
            }
        } catch (error) {
            console.error("Failed to connect to Redis:", error);
        }
    }

    public static getInstance(name: string, url: string): Promise<RedisSingleton> {
        if (!this.instances.has(name)) {
            const instancePromise = (async () => {
                const instance = new RedisSingleton(url);
                await instance.connect();
                return instance;
            })();
            this.instances.set(name, instancePromise);
        }
        return this.instances.get(name)!;
    }

    public get client(): RedisClientType {
        return this._client;
    }
}

// Export separate instances for different Redis databases
const rateLimitRedis = RedisSingleton.getInstance("rateLimit", ENV.REDIS.RATE_LIMIT_DATABASE_URL);

export { rateLimitRedis };
