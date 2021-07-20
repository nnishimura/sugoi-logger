/**
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 * @see https://github.com/lodash/lodash/blob/4.17.15/lodash.js#L11743
 */
export function isObject(value: any) {
    return value != null && typeof value == "object";
}