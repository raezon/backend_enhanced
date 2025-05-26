import { jest } from "@jest/globals";

// Mock Redis Client
export interface RedisMockClient {
    get: jest.Mock<(key: string) => Promise<string | null>>;
    set: jest.Mock<(key: string, value: string) => Promise<string>>;
    del: jest.Mock<(keys: string | string[]) => Promise<number>>;
    on: jest.Mock<(event: string, listener: (...args: any[]) => void) => void>;
    quit: jest.Mock<() => Promise<void>>;
    connect: jest.Mock<() => Promise<void>>;
    isOpen: boolean;
}

let mockRedisInstance: RedisMockClient | null = null;

const createMockRedisClient = (): RedisMockClient => ({
    get: jest.fn(() => Promise.resolve(null)),
    set: jest.fn(() => Promise.resolve("OK")),
    del: jest.fn(() => Promise.resolve(1)),
    on: jest.fn(),
    quit: jest.fn(() => Promise.resolve()),
    connect: jest.fn(() => Promise.resolve()),
    isOpen: true,
});

export const mockRedis = (): RedisMockClient => {
    if (!mockRedisInstance) {
        mockRedisInstance = createMockRedisClient();
    }
    return mockRedisInstance;
};

// Mock Redis Module
jest.mock("redis", () => ({
    createClient: jest.fn(() => mockRedis()),
}));

// Mock RedisSingleton Class
jest.mock("@config/redis.config", () => {
    class MockRedisSingleton {
        private static instances = new Map<string, Promise<MockRedisSingleton>>();
        private readonly _client: RedisMockClient;

        private constructor(_url: string) {
            this._client = mockRedis();
        }

        public static getInstance(name: string, url: string): Promise<MockRedisSingleton> {
            if (!this.instances.has(name)) {
                const instancePromise = Promise.resolve(new MockRedisSingleton(url));
                this.instances.set(name, instancePromise);
            }
            return this.instances.get(name)!;
        }

        public get client(): RedisMockClient {
            return this._client;
        }
    }

    return { RedisSingleton: MockRedisSingleton };
});
