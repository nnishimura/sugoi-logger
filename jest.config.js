"use strict";

module.exports = {
    "collectCoverage": true,
    "coverageReporters": ["json", "lcov", "text", "clover", "text-summary"],
    "testEnvironment": "node",
    "testMatch": [
        "**/test/**/*.+(ts|tsx|js)",
    ],
    "testPathIgnorePatterns": [
        "node_modules"
    ],
    "preset": "ts-jest"
};
