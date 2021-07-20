import { Logger } from "../src/logger";
import { LogOptions, FormatterOptions, LogType } from "../src/types";
import { formatToJson } from "../src/formatter/format-to-json";

jest.mock("../src/utils/parse-stack-trace.ts");

const timestamp = new Date().toISOString();
describe("format-to-json", () => {
    beforeEach(() => { jest.resetAllMocks(); });

    const logPatterns = [
        {
            message: "log message",
            expected: {"application": "node", "data": {}, "hostname": "sugoiMachine", "level": "Error", "requestId": 111, "message": "log message", "pid": 74955, "thread": 74955, "time": timestamp, "file": "sugoiCode.ts", "line": 30}
        },
        {
            message: "log message with different request id",
            context: { messageId: 222 },
            expected: {"application": "node", "data": {}, "hostname": "sugoiMachine", "level": "Error", "requestId": 222, "message": "log message with different request id", "pid": 74955, "thread": 74955, "time": timestamp, "file": "sugoiCode.ts", "line": 30}
        },
        {
            message: "log message with single meta info",
            data: { traffic: { ip: "192.0.2.0", counter: 100 } },
            expected: {"application": "node", "data": {"traffic": {"counter": 100, "ip": "192.0.2.0"}}, "hostname": "sugoiMachine", "level": "Error", "requestId": 111, "message": "log message with single meta info", "pid": 74955, "thread": 74955, "time": timestamp, "file": "sugoiCode.ts", "line": 30}
        },
        {
            message: "log message with custom facility value",
            data: { traffic: { ip: "192.0.2.0", counter: 100 } },
            facility: 0, // kernel messages
            expected: {"application": "node", "data": {"traffic": {"counter": 100, "ip": "192.0.2.0"}}, "hostname": "sugoiMachine", "level": "Error", "requestId": 111, "message": "log message with custom facility value", "pid": 74955, "thread": 74955, "time": timestamp, "file": "sugoiCode.ts", "line": 30}
        },
        {
            message: "log message with 2 meta info",
            data: { traffic: { ip: "192.0.2.0", counter: 100 }, user: { userId: 123 } },
            expected: {"application": "node", "data": {"traffic": {"counter": 100, "ip": "192.0.2.0"}, "user": {"userId": 123}}, "hostname": "sugoiMachine", "level": "Error", "requestId": 111, "message": "log message with 2 meta info", "pid": 74955, "thread": 74955, "time": timestamp, "file": "sugoiCode.ts", "line": 30}
        },
        {
            message: "log message with custom application name",
            application: "myapp",
            data: { traffic: { ip: "192.0.2.0", counter: 100 }, user: { userId: 123 } },
            expected: {"application": "myapp", "data": {"traffic": {"counter": 100, "ip": "192.0.2.0"}, "user": {"userId": 123}}, "hostname": "sugoiMachine", "level": "Error", "requestId": 111, "message": "log message with custom application name", "pid": 74955, "thread": 74955, "time": timestamp, "file": "sugoiCode.ts", "line": 30}
        },
        {
            message: "log message with structured data + falsy values",
            application: "myapp",
            data: { sdId: { nullKey: null, falseKey: false, emptyString: "" } as any },
            expected: {"application": "myapp", "data": {"sdId": { "nullKey": null, "falseKey": false, "emptyString": "" } as any }, "hostname": "sugoiMachine", "level": "Error", "requestId": 111, "message": "log message with structured data + falsy values", "pid": 74955, "thread": 74955, "time": timestamp, "file": "sugoiCode.ts", "line": 30}
        }
    ];

    logPatterns.forEach(({ application, message, expected, data, context, facility }) => {
        test(`can format ${message}`, () => {
            const mockTransport = jest.fn();
            const formatter = (args: FormatterOptions): string => {
                const mockArgs: FormatterOptions = {
                    ...args,
                    timestamp,
                    facility: !isNaN(facility) ? facility : args.facility,
                    hostname: "sugoiMachine",
                    pid: 74955,
                    context: context || {
                        messageId: 111
                    },
                    data: data || args.data
                };
                return formatToJson(mockArgs);
            };

            const logger = new Logger({
                transports: [mockTransport],
                formatter,
                application: application || "node"
            });

            logger.error(message);
            const logParams = mockTransport.mock.calls[0][0] as LogOptions;
            const formatted = JSON.parse(logParams.message);
            expect(formatted).toEqual(expected);
        });
    });

    test("can specify json as logType", () => {
        const mockTransport = jest.fn();
        const formatter = (args: FormatterOptions): string => {
            const mockArgs: FormatterOptions = {
                ...args,
                timestamp,
                hostname: "sugoiMachine",
                application: "node",
                pid: 74955
            };
            return formatToJson(mockArgs);
        };

        const logger = new Logger({
            transports: [mockTransport],
            formatter,
            logType: LogType.json,
            context: {
                messageId: 111
            }
        });

        logger.error("destroy all humans");
        const logParams = mockTransport.mock.calls[0][0] as LogOptions;
        const formatted = JSON.parse(logParams.message);
        expect(formatted).toEqual({"application": "node", "data": {}, "hostname": "sugoiMachine", "level": "Error", "requestId": 111, "message": "destroy all humans", "pid": 74955, "thread": 74955, "time": timestamp, file: "sugoiCode.ts", "line": 30 });
    });
});