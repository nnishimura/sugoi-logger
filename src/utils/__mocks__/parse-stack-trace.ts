// Mocking node_modules/stacktrace-parser for jest unit testing.
// @see https://jestjs.io/docs/manual-mocks

export const parseStackTrace = () => {
    return { file: "sugoiCode.ts", lineNumber: 30 };
};