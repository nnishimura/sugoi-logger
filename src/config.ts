import os from "os";
import { formatToSyslog, formatToJson } from "./formatter";
import { logToConsole } from "./transports/console";
import { Levels, LogType } from "./types";

/**
 * Logging levels conform to the severity ordering specified by RFC5424
 */
export const levels: Levels = {
    emergency: 0,
    alert: 1,
    critical: 2,
    error: 3,
    warning: 4,
    notice: 5,
    info: 6,
    debug: 7
};

export const formatters = {
    [LogType.syslog]: formatToSyslog,
    [LogType.json]: formatToJson
};

export function getDefaultLoggerConfig () {
    const envLogType = (process.env.LOGGING_TYPE || "").toLowerCase() as LogType;
    let logType = LogType.syslog;
    if (envLogType && Object.keys(LogType).indexOf(envLogType) > -1) {
        logType = envLogType;
    }
    return {
        levels,
        logType,
        formatter: formatters[logType],
        transports: [logToConsole],
        data: {},
        application: process.title,
        context: {
            messageId: process.pid
        }
    };
}

export function getDefaultLogConfig () {
    return {
        timestamp: new Date().toISOString(),
        hostname: os.hostname(),
        pid: process.pid,
        level: "info",
        severity: 6,
        facility: 23,
        message: "",
        data: {},
        context: {
            messageId: process.pid
        },
        stderrLevels: ["error", "critical", "alert", "emergency"]
    };
}