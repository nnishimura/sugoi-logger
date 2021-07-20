import { createNamespace } from "cls-hooked";
import { v4 as uuidv4 } from "uuid";

/**
 * CLS namespace that will persist until next route
 */
export const loggerNamespace = createNamespace("writer");

/**
 * ID of the namespace used in the logger
 */
 const loggerNamespaceId = "MESSAGE_ID";

/**
 * returns a middleware to reset current CLS namespace and sets a new message_id. 
 * 
 * * @param {(...args: any[]) => any}  callback - Function to call for this context
 * * @param {string}  messageId - messageId to set in logging message. defaults to uuidv4()
 */
export function setMessageId (callback: (...args: any[]) => any, messageId?: string): void {
    loggerNamespace.run(() => {
        loggerNamespace.set(loggerNamespaceId, messageId || uuidv4());
        callback();
    });
}

/**
 * returns a MESSAGE_ID from current CLS namespace
 */
export function getMessageId() {
    return loggerNamespace.get(loggerNamespaceId);
}