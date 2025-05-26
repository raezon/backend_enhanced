import { RedisSingleton } from "@config/redis";
import { jest } from "@jest/globals";

jest.mock("@config/redis.config", () => import("./test/__mocks__/redisSingleton"));
jest.mock("redis", () => import("./test/__mocks__/redis"));

// Mock Redis module
jest.mock("redis", () => ({
    createClient: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve(null)),
        set: jest.fn(() => Promise.resolve("OK")),
        del: jest.fn(() => Promise.resolve(1)),
        on: jest.fn(),
        quit: jest.fn(() => Promise.resolve()),
        connect: jest.fn(() => Promise.resolve()),
        isOpen: true,
    })),
}));

// Mock RedisSingleton class
jest.mock("@config/redis.config", () => {
    class MockRedisSingleton {
        private static instances = new Map<string, Promise<MockRedisSingleton>>();
        private readonly _client: any;

        private constructor(_url: string) {
            this._client = {
                get: jest.fn(() => Promise.resolve(null)),
                set: jest.fn(() => Promise.resolve("OK")),
                del: jest.fn(() => Promise.resolve(1)),
                on: jest.fn(),
                quit: jest.fn(() => Promise.resolve()),
                connect: jest.fn(() => Promise.resolve()),
                isOpen: true,
            };
        }

        public static getInstance(name: string, url: string): Promise<MockRedisSingleton> {
            if (!this.instances.has(name)) {
                const instancePromise = Promise.resolve(new MockRedisSingleton(url));
                this.instances.set(name, instancePromise);
            }
            return this.instances.get(name)!;
        }

        public get client(): any {
            return this._client;
        }
    }

    return { RedisSingleton: MockRedisSingleton };
});

// Mock Prisma
jest.mock("@config/prisma.config", () => {
    const prismaMock = {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };
    return { default: prismaMock };
});

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    (RedisSingleton as any).instances = new Map();
});
