import { promisify } from "util";
import assert from "assert";
import {InternalError,TimeoutError} from "./error"

export class RetryTooManyTimesError extends InternalError {
  /**
   * 
   * @param {Error} e
   * @param {int} times 
   */
  constructor(e, times) {
    const error = InternalError.wrapError(e);
    super(`too many retries(${times}): ${error.constructor.name}("${error.message}")`, error.extraInfo);
    this.stack = e.stack;
    this.httpCode = 408;
    this.type = "TIMEOUT";
  }
}

export const sleep = promisify(setTimeout);

/**
 * 
 * @param {any} obj
 * @param {string} type 
 */
export const validateArgument = (obj, type, name) => {
  assert(typeof obj == type, `${name} expecting to be ${type}`);
}

/**
 * @async
 * @template T
 * @param {() => Promise<T>} fn 
 * @param {int} [timeoutMs=5000]
 * @returns {Promise<T>}
 */
export const Timeout = async (fn, timeoutMs = 5000) => {
  const timeoutError = new TimeoutError(`Timeout after ${timeoutMs}ms`);
  let timeout;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeout = setTimeout(() => {
      reject(timeoutError);
    }, timeoutMs);
  });

  const asyncFn = fn().then((obj) => {
    clearTimeout(timeout);
    return obj;
  });
  return Promise.race([asyncFn, timeoutPromise]);
}

/**
 * @async
 * @template T
 * @param {() => Promise<T>} fn 
 * @param {int} [times = 3]
 * @param {class} exceptionClass
 * @returns {Promise<T>}
 */
export const Retry = async (fn, times = 3, exceptionClass = null) => {
  let timesTried = 0;
  const retry = () => fn().catch(async (e) => {
    if(exceptionClass == null || e instanceof exceptionClass) {
      if (timesTried++ >= times) {
        throw new RetryTooManyTimesError(e, times);
      } else {
        const sleepMs = Math.min(timesTried, 5) * 1000 * Math.random() + 500;
        console.warn(`Got an exception retrying in ${sleepMs}`, e);
        await sleep(sleepMs);
        console.trace(`Retry ${timesTried}`);
        return await retry();
      }
    } else {
      throw e;
    }
  })
  return await retry();
}

/**
 * @async
 * @template T
 * @param {() => Promise<T>} fn 
 * @param {int} [timeout = 5000]
 * @param {int} [times = 3]
 * @returns {Promise<T>}
 */
export const RetryOnTimeout = async(fn, timeout = 5000 , retries = 3) => {
  return await Retry(() => Timeout(fn, timeout), retries, TimeoutError)
}