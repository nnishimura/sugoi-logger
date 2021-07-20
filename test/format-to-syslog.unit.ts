/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-empty-function */
import { Logger } from "../src/logger";
import { LogOptions, FormatterOptions, LogType } from "../src/types";
import { formatToSyslog } from "../src/formatter/format-to-syslog";

jest.mock("../src/utils/parse-stack-trace.ts");

const timestamp = new Date().toISOString();
describe("format-to-syslog", () => {
    beforeEach(() => { jest.resetAllMocks(); });

    const logPatterns = [
        {
            message: "log message",
            expected: `<187>1 ${timestamp} sugoiMachine node 74955 111 sugoiCode.ts:30 - log message`
        },
        {
            message: "log message with different request id",
            context: { messageId: 222 },
            expected: `<187>1 ${timestamp} sugoiMachine node 74955 222 sugoiCode.ts:30 - log message with different request id`
        },
        {
            message: "log message with single meta info",
            data: { traffic: { ip: "192.0.2.0", counter: 100 } },
            expected: `<187>1 ${timestamp} sugoiMachine node 74955 111 sugoiCode.ts:30 [traffic ip="192.0.2.0" counter="100"] log message with single meta info`
        },
        {
            message: "log message with custom facility value",
            data: { traffic: { ip: "192.0.2.0", counter: 100 } },
            facility: 0, // kernel messages
            expected: `<3>1 ${timestamp} sugoiMachine node 74955 111 sugoiCode.ts:30 [traffic ip="192.0.2.0" counter="100"] log message with custom facility value`
        },
        {
            message: "log message with 2 meta info",
            data: { traffic: { ip: "192.0.2.0", counter: 100 }, user: { userId: 123 } },
            expected: `<187>1 ${timestamp} sugoiMachine node 74955 111 sugoiCode.ts:30 [traffic ip="192.0.2.0" counter="100"][user userId="123"] log message with 2 meta info`
        },
        {
            message: "log message with custom application name",
            application: "myapp",
            data: { traffic: { ip: "192.0.2.0", counter: 100 }, user: { userId: 123 } },
            expected: `<187>1 ${timestamp} sugoiMachine myapp 74955 111 sugoiCode.ts:30 [traffic ip="192.0.2.0" counter="100"][user userId="123"] log message with custom application name`
        },
        {
            message: "log message with nested structured data",
            application: "myapp",
            data: { user: { userId: 123, settings: { isSubscribed: true } } },
            expected: `<187>1 ${timestamp} sugoiMachine myapp 74955 111 sugoiCode.ts:30 [user userId="123" settings=\"{\"isSubscribed\":true}\"] log message with nested structured data`
        }, {
            message: "log message with structured data + series of weird structured data values",
            application: "myapp",
            // Disable type check to test with edge cases
            // @ts-ignore
            data: { sdId: { nullKey: null, falseKey: false, nanKey: NaN, emptyString: "" } },
            expected: `<187>1 ${timestamp} sugoiMachine myapp 74955 111 sugoiCode.ts:30 [sdId nullKey=\"null\" falseKey=\"false\" nanKey=\"NaN\" emptyString=\"\"] log message with structured data + series of weird structured data values`
        }, {
            message: "log message with structured data + series of weird structuredParams",
            application: "myapp",
            // @ts-ignore
            data: { sdId1: null, sdId2: undefined, sdId3: NaN, sdId4: {}, sdId5: { matryoshka: { matryoshka: { matryoshka: { matryoshka: "matryoshka" } }} }, sdId6: "", sdId7: "not object", sbId8: () => {}, sbId9: [1,2,3], sdId10: [[[]]], war: Infinity },
            expected: `<187>1 ${timestamp} sugoiMachine myapp 74955 111 sugoiCode.ts:30 [sdId1 invalidSdParam=null][sdId2 invalidSdParam=undefined][sdId3 invalidSdParam=NaN][sdId4][sdId5 matryoshka=\"{\"matryoshka\":{\"matryoshka\":{\"matryoshka\":\"matryoshka\"}}}\"][sdId6 invalidSdParam=][sdId7 invalidSdParam=not object][sbId8 invalidSdParam=function () { }][sbId9 0=\"1\" 1=\"2\" 2=\"3\" length=\"3\"][sdId10 0=\"[[]]\" length=\"1\"][war invalidSdParam=Infinity] log message with structured data + series of weird structuredParams`
        }, {
            message: "log message with null structured data",
            application: "myapp",
            // @ts-ignore
            data: null,
            expected: `<187>1 ${timestamp} sugoiMachine myapp 74955 111 sugoiCode.ts:30 - log message with null structured data`
        }, {
            message: "log message with structured data in string",
            application: "myapp",
            // @ts-ignore
            data: "I was expecting object here",
            expected: `<187>1 ${timestamp} sugoiMachine myapp 74955 111 sugoiCode.ts:30 I was expecting object here log message with structured data in string`
        }, {
            message: "log message with structured data in array",
            application: "myapp",
            // @ts-ignore
            data: [null, undefined, NaN, {}, "", "unclepaco", () => {}, {}, [[[]]]],
            expected: `<187>1 ${timestamp} sugoiMachine myapp 74955 111 sugoiCode.ts:30 [0 invalidSdParam=null][1 invalidSdParam=undefined][2 invalidSdParam=NaN][3][4 invalidSdParam=][5 invalidSdParam=unclepaco][6 invalidSdParam=function () { }][7][8 0=\"[[]]\" length=\"1\"] log message with structured data in array`
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
                    // disable ts check to test with more edge cases
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    data: data || args.data
                };
                return formatToSyslog(mockArgs);
            };

            const logger = new Logger({
                logType: LogType.syslog,
                transports: [mockTransport],
                formatter,
                application: application || "node"
            });

            logger.error(message);
            const logParams = mockTransport.mock.calls[0][0] as LogOptions;
            expect(logParams.message).toEqual(expected);
        });
    });

    test("can specify syslog as logType", () => {
        const mockTransport = jest.fn();
        const formatter = (args: FormatterOptions): string => {
            const mockArgs: FormatterOptions = {
                ...args,
                timestamp,
                hostname: "sugoiMachine",
                application: "node",
                pid: 74955
            };
            return formatToSyslog(mockArgs);
        };

        const logger = new Logger({
            logType: LogType.syslog,
            transports: [mockTransport],
            formatter,
            context: {
                messageId: 111
            }
        });

        logger.error("destroy all humans");
        const logParams = mockTransport.mock.calls[0][0] as LogOptions;
        expect(logParams.message).toEqual(`<187>1 ${timestamp} sugoiMachine node 74955 111 sugoiCode.ts:30 - destroy all humans`);
    });

    test("should not throw an error on circlar reference object", () => {
        // creating circular reference object for this test
        const circularReference = { sd: { otherData: 123 } } as any;
        circularReference.myself = circularReference;

        const mockTransport = jest.fn();
        const formatter = (args: FormatterOptions): string => {
            const mockArgs: FormatterOptions = {
                ...args,
                timestamp,
                hostname: "sugoiMachine",
                application: "node",
                pid: 74955
            };
            return formatToSyslog(mockArgs);
        };

        const logger = new Logger({
            logType: LogType.syslog,
            transports: [mockTransport],
            formatter,
            context: {
                messageId: 111
            }
        });

        logger.error("destroy all humans", { data: { Error: circularReference }});
        const logParams = mockTransport.mock.calls[0][0] as LogOptions;
        expect(logParams.message).toEqual(`<187>1 ${timestamp} sugoiMachine node 74955 111 sugoiCode.ts:30 [Error sd=\"{\"otherData\":123}\" myself=\"{\"sd\":{\"otherData\":123},\"myself\":{\"$ref\":\"$\"}}\"] destroy all humans`);
    });
});