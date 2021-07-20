/**
 * format-to-json.ts: Format log into json
 */

import { parseStackTrace } from "../utils/parse-stack-trace";
import { TransportOptions, JsonLogger } from "../types";

export function prepareFormatToJson (options: TransportOptions): JsonLogger {
    const formattedLevel = options.level.charAt(0).toUpperCase() + options.level.slice(1);
    const { file, lineNumber } = parseStackTrace(5);

    return {
        "time": options.timestamp,
        "hostname": options.hostname,
        "application": options.application,
        "pid": options.pid,
        "thread": options.pid, // single threaded
        "message_id": options.context?.messageId,
        "level": formattedLevel,
        "message": options.message,
        "data": options.data,
        "file": file,
        "line": lineNumber
    };
}

export function formatToJson(options: TransportOptions): string {
    return JSON.stringify(prepareFormatToJson(options));
}
