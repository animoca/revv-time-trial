export function sleep(sleepMs) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, sleepMs);
    })
  }
  
  /**
  * @async
  * @template T
  * @param {() => Promise<T>} fn 
  * @param {int} [timeoutMs=5000]
  * @returns {Promise<T>}
  */
  export const timeout = async (fn, timeoutMs = 5000) => {
    const timeoutError = new Error(`Timeout after ${timeoutMs}ms`);
    let timeoutReject;
    const timeoutPromise = new Promise((resolve, reject) => {
        timeoutReject = setTimeout(() => {
            reject(timeoutError);
        }, timeoutMs);
    });
  
    const asyncFn = fn().then((obj) => {
        clearTimeout(timeoutReject);
        return obj;
    });
    return Promise.race([asyncFn, timeoutPromise]);
  }
  
  /**
  * @async
  * @template T
  * @param {() => Promise<T>} fn 
  * @param {int} [times = 3]
  * @returns {Promise<T>}
  */
  export const retry = async (fn, errorCallback, abortSignal = null, times = 3) => {
    let hasCancelled = false;
    const cancel = () => hasCancelled = true;
    abortSignal && abortSignal.addEventListener("abort", cancel);
  
    let timesTried = 0;
    const retry = () => fn().catch(async (e) => {
        if (hasCancelled) {
            return;
        }
  
        if (timesTried++ >= times) {
            if (typeof errorCallback === "function") {
                errorCallback(e);
            }
            throw new Error(`too many retries(${times}): ${e}`);
        } else {
            const sleepMs = Math.min(timesTried, 5) * 1000 * Math.random() + 500;
            await sleep(sleepMs);
            return await retry();
        }
    }).finally(() => {
        abortSignal && abortSignal.removeEventListener("abort", cancel);
    })
    return await retry();
  }
  
  /**
  * @async
  * @template T
  * @param {() => Promise<T>} fn 
  * @param {int} [timeoutInterval = 5000]
  * @param {int} [times = 3]
  * @returns {Promise<T>}
  */
  export const retryOnTimeout = async (fn, options) => {
    const { errorCallback = null, maxExecutionTimes = 3, abortSignal = null, timeoutInterval = 5000 } = options || {};
    return await retry(() => timeout(fn, timeoutInterval), errorCallback, abortSignal, maxExecutionTimes);
  }
  