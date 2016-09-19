/**
 * Call a Node.js-style asynchronous function and return a correspondent
 * promise.
 */
export function call<T>(fn: Function, ...args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        fn(...args, (error: any, value: T) => {
            if (error) {
                reject(error);
            } else {
                resolve(value);
            }
        });
    });
}
