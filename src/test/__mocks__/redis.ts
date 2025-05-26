import { createClient } from "redis-mock";
import { jest } from "@jest/globals";

// Updated interface with correct mock types
export interface RedisMockClient {
    get: jest.Mock<(key: string) => Promise<string | null>>;
    set: jest.Mock<(key: string, value: string) => Promise<string>>;
    del: jest.Mock<(keys: string | string[]) => Promise<number>>;
    on: jest.Mock<(event: string, listener: (...args: any[]) => void) => void>;
    quit: jest.Mock<() => Promise<void>>;
    // Add other Redis methods you need below
    [key: string]: any;
}

// Create a singleton instance of the mock Redis client
const createMockRedisClient = (): RedisMockClient => {
    const client = createClient() as any;

    // Mock Redis methods with Jest
    client.get = jest.fn();
    client.set = jest.fn();
    client.del = jest.fn();
    client.on = jest.fn();
    client.quit = jest.fn();

    // Add default implementations if needed
    client.get.mockImplementation(() => Promise.resolve(null));
    client.set.mockImplementation(() => Promise.resolve("OK"));
    client.del.mockImplementation(() => Promise.resolve(1));
    client.on.mockImplementation((event: string, callback: () => void) => {
        if (event === "connect") callback();
    });

    return client;
};

// Global mock instance
let mockRedisInstance: RedisMockClient | null = null;

export const mockRedis = (): RedisMockClient => {
    if (!mockRedisInstance) {
        mockRedisInstance = createMockRedisClient();
    }
    return mockRedisInstance;
};

// Utility function to reset all mocks
export const resetRedisMocks = () => {
    if (mockRedisInstance) {
        mockRedisInstance.get.mockReset();
        mockRedisInstance.set.mockReset();
        mockRedisInstance.del.mockReset();
        mockRedisInstance.on.mockReset();
        mockRedisInstance.quit.mockReset();
    }
};

// Default export for Jest module mocking
export default mockRedis();
