/**
 * format-to-syslog.ts: Format log into RFC 5424 syslog format
 */

import { decycle } from "json-cyclic";
import { isObject } from "../utils/is-object";
import { parseStackTrace } from "../utils/parse-stack-trace";
import { TransportOptions, StructuredData } from "../types";

 export function formatStructuredData (data: StructuredData) {
    if (!isObject(data)) return data;

     const structuredDataList: string[] = Object.keys(data).reduce((list, sdElement: string) => {
         const sdParam = data[sdElement];
         if (!isObject(sdParam)) {
            return [...list, `[${sdElement} invalidSdParam=${sdParam}]`];
         }
         // Use getOwnPropertyNames to support  non-enumerable object (e.g. JS Error())
         const sdMessage = Object.getOwnPropertyNames(sdParam).reduce((sdData, s) => {
           let sdValues;
            try {
                sdValues = JSON.stringify(sdParam[s]);
             } catch (error) {
                sdValues = JSON.stringify(decycle(sdParam[s]));
             }

             const value = typeof sdParam[s] === "object" && sdParam[s] !== null ? sdValues : sdParam[s];
             return `${sdData} ${s}="${value}"`;
         }, "");
         list.push(`[${sdElement}${sdMessage}]`);
         return list;
     }, []);
 
     const sd = structuredDataList.reduce((structuredData, s) => `${structuredData}${s}`, "");
     return sd.trim();
 }
 
 export function formatToSyslog (options: TransportOptions, _type = "rfc5424") {
     const version = 1;
     const structuredData = formatStructuredData(options.data);
    const { file, lineNumber } = parseStackTrace(4);
    
     return `<${options.facility * 8 + options.severity}>${version} ${options.timestamp} ${options.hostname} ${options.application} ${options.pid || "-"} ${options.context?.messageId || "-"} ${file}:${lineNumber} ${structuredData || "-"} ${options.message}`;
 }