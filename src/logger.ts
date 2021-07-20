/**
 * logger.ts: Logger class to manage logging configurations
 */

import { LogOptions, Transport, LoggerOptions, Context, LogType, Formatter, StructuredData } from "./types";
import { getDefaultLoggerConfig, getDefaultLogConfig } from "./config";
import { getMessageId } from "./context";

export class Logger {
    private formatter: Formatter;
    private transports: Transport[];
    private data: StructuredData;
    private context: Context;
    private application: string;
    private logType: LogType;

    constructor(options: LoggerOptions = {}) {
        const defaultLoggerConfig = getDefaultLoggerConfig();
        this.formatter = options.formatter || defaultLoggerConfig.formatter;
        this.transports =  options.transports || defaultLoggerConfig.transports;
        this.data = options.data || defaultLoggerConfig.data;
        this.context = options.context || defaultLoggerConfig.context;
        this.application = options.application || defaultLoggerConfig.application;

        const formattedLogType = (options.logType || "").toLowerCase() as LogType;

        if (formattedLogType && Object.keys(LogType).indexOf(formattedLogType) === -1) {
            throw `[logger] Class.Logger.constructor: Invalid option.logType value: ${options.logType}`;
        }

        this.logType = formattedLogType || defaultLoggerConfig.logType;
    }

    public debug (message: string, data?: LogOptions) {
        this.log("debug", message, data);
    }

    public info (message: string, data?: LogOptions) {
        this.log("info", message, data);
    }

    public notice (message: string, data?: LogOptions) {
        this.log("notice", message, data);
    }

    public warning (message: string, data?: LogOptions) {
        this.log("warning", message, data);
    }

    public error (message: string, data?: LogOptions) {
        this.log("error", message, data);
    }

    public critical (message: string, data?: LogOptions) {
        this.log("critical", message, data);
    }

    public alert (message: string, data?: LogOptions) {
        this.log("alert", message, data);
    }

    public emergency (message: string, data?: LogOptions) {
        this.log("emergency", message, data);
    }

    private log (level: string, message: string, options: LogOptions = {}) {
        try {
            const defaultLogConfig = getDefaultLogConfig();
            const defaultLoggerConfig = getDefaultLoggerConfig();
            const messageId = getMessageId();

            const context = options.context || this.context || defaultLogConfig.context;
            const formattedContext = messageId ? {
                ...context,
                messageId
            }: context;

            const logOptions = {
                timestamp: options.timestamp || defaultLogConfig.timestamp,
                hostname: options.hostname || defaultLogConfig.hostname,
                application: options.application || this.application,
                pid: options.pid || defaultLogConfig.pid,
                level,
                severity: defaultLoggerConfig.levels[level] || defaultLogConfig.severity,
                facility: options.facility || defaultLogConfig.facility,
                message: message || defaultLogConfig.message,
                data: options.data || this.data || defaultLogConfig.data,
                context: formattedContext,
                stderrLevels: options.stderrLevels || defaultLogConfig.stderrLevels,
            };
            const logMessage = this.formatter(logOptions);
            this.transports.forEach((transport) => {
                transport({
                    ...logOptions,
                    message: logMessage
                });
            });
        } catch (error) {
            console.error(`Error while parsing log for message: ${message}, error info: `, { error: error?.message, options });
        }
    }
}