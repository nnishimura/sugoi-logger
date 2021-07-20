import { parse } from "stacktrace-parser";
import appRoot from "app-root-path";
import path from "path";

/**
 * @description
 * Returns filename and lineNumber of the caller relative to the project root
 *
 * @returns {object} returns filename and linenumber of the caller
 */
export function parseStackTrace(stackTraceIndex: number): { file?: string, lineNumber?: number } {
    try {
        const stackTrace = parse(new Error().stack)[stackTraceIndex];
        const rootPath = appRoot.toString();

        const filePath = rootPath ? path.relative(rootPath, stackTrace?.file) : stackTrace?.file;

        return { file: filePath, lineNumber: stackTrace?.lineNumber };
    } catch (error) {
        // swallow error
        console.error("Failed to parse stack trace in logging: ", error?.message);
        return { file: undefined, lineNumber: undefined };
    }
}