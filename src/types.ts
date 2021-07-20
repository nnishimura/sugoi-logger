/**
 * Logging type
 * This is for the logging type for the system.
This information is collected from the environment variable 'LOGGING_TYPE'
 */
export enum LogType {
    syslog = "syslog",
    json = "json"
}

export interface Levels {
    [level: string]: number
}

export interface LogOptions {
    /**
     * timestamp in ISO format
     */
    timestamp?: string;

    /**
     * name of the host that originally generated the message, defaults to os.hostname()
     */
    hostname?: string;

    /**
     * the name of the application, defaults to process.title
     */
    application?: string;

    /**
     * PID of the process that generated this message
     */
    pid?: number;

    /**
     * Facility code to use sending this message. defaults to 23 (local use 7)
     */
    facility?: number;

    /**
     * description of the event or error in English
     */
    message?: string;
    
    /**
     * additional properties for this logger. 
     * @example { user: { userId: 123 } }
     */
    data?: Metadata;

    /**
     * context of this log message in key-value format. 
     * @example { messageId: 123 }
     */
    context?: Context;

    /**
     * levels to trigger stderr 
     */
    stderrLevels?: string[];
}

export interface FormatterOptions {
    /**
     * timestamp in ISO format
     */
    timestamp: string;

    /**
     * The host running syslogd, defaults to os.hostname()
     */
    hostname: string;

    /**
     * the name of the application, defaults to process.title
     */
    application: string;

    /**
     * PID of the process that log messages are coming from
     */
    pid: number;

    /**
     * severity level of the log
     */
    level: string;

    /**
     * the order of severity
     */
    severity: number;

    /**
     * Facility code to use sending this message. defaults to 23 (local use 7)
     */
    facility: number;

    /**
     * description of the event or error in English
     */
    message: string;
    
    /**
     * additional properties for this logger.
     * @example { user: { userId: 123 } }
     */
    data?: StructuredData;

    /**
     * context of this log message in key-value format. 
     * @example { messageId: 123 }
     */
    context?: Context;

    /**
     * levels to trigger stderr 
     */
    stderrLevels: string[];
}

export type TransportOptions = FormatterOptions;

export type Formatter = (arg: FormatterOptions) => string
export type Transport = (arg: FormatterOptions) => void

export interface Metadata {
    [key: string]: any;
}

export interface Context {
    [key: string]: any;
}

export interface LoggerOptions {
    /**
     * logging type of this logger. by default this info is collected from the environment variable 'LOGGING_TYPE' but can be overwritten.
     */
    logType?: LogType,
    /**
     * formatter function for log message
     */
    formatter?: Formatter;

    /**
     * set of logging transport functions
     */
    transports?: Transport[];

    /**
     * name of application. defaults to process.title
     */
    application?: string;

     /**
     * additional properties for this logger.
     * @example { user: { userId: 123 } }
     */
    data?: StructuredData;

    /**
     * context of this log message in key-value format. 
     * @example { messageId: 123 }
     */
     context?: Metadata;
}

export type StructuredElement = Record<string | number, any>

export interface StructuredData {
    [sdId: string]: StructuredElement
}

export interface MessageOptions {
    /**
     * level of the logging message
     */
    level: string;

   /**
     * description of the event or error in English
     */
    message: string;

    /**
     * additional properties for this logger. For RFC5424 messages, you can also include structured data here
     * @example { user: { userId: 123 } }
     */
    meta: Metadata;
}

export interface JsonLogger {
    /**
     * timestamp in ISO format
     */
    time: string;

    /**
     * The host running syslogd, defaults to os.hostname()
     */
    hostname: string;

    /**
     * the name of the application, defaults to process.title
     */
    application: string;

    /**
     * PID of the process that log messages are coming from
     */
    pid: number;

    /**
     * id of the current thread. Nodejs server is single thread so this field is to just align with rust logging lib. defaults to pid.
     */
    thread: number;

    /**
     * id of this log
     */
    request_id: string;

    /**
     * levels of severity. starts with capital
     */
    level: string;

    /**
     * description of the event or error in English
     */
    message: string;
    
    /**
     * additional properties for this logger
     */
    data?: Metadata;

    /**
     * path of the file where log message is originated from
     */
    file: string;

    /**
     * line number of the file where log message is originated from
     */
    line: number;
}