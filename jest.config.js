/** @type {import("jest").Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
        "!src/**/*.spec.ts",
        "!src/**/*.test.ts",
        "!src/server.ts",
        "!src/app.ts",
        "!src/router.ts",
        "!src/scripts/**/*",
        "!src/business-logic/models/**/*",
        "!src/business-logic/aggregations/**/*",
    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@config/(.*)$": "<rootDir>/src/config/$1",
        "^@utils/(.*)$": "<rootDir>/src/utils/$1",
        "^@types/(.*)$": "<rootDir>/src/types/$1",
        "^@business/(.*)$": "<rootDir>/src/business-logic/$1",
    },
    moduleDirectories: ["node_modules", "src"],
    setupFilesAfterEnv: ["<rootDir>/src/setup.jest.ts"],
};
