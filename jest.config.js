"use strict";

module.exports = {
    "collectCoverage": true,
    "coverageReporters": ["json", "lcov", "text", "clover", "text-summary"],
    "testEnvironment": "node",
    "testMatch": [
        "**/*.unit.(ts|js)",
    ],
    "testPathIgnorePatterns": [
        "node_modules"
    ],
    "preset": "ts-jest"
};
