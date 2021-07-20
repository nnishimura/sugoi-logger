/**
 * console.ts: Transport for outputting to the console.
 */

import { EOL } from "os";
import { TransportOptions } from "../types";

export function logToConsole (options: TransportOptions) {
    const level = options.level.toLowerCase();
    if (options?.stderrLevels.indexOf(level) > -1) {
        process.stderr.write(options.message + EOL);
    } else {
        process.stdout.write(options.message + EOL);
    }
}