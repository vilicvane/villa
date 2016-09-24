import { NodeStyleCallback } from './'

export type NodeStyleAsyncFunction<T> =
    ((callback: NodeStyleCallback<T>) => any) |
    ((arg0: any, callback: NodeStyleCallback<T>) => any) |
    ((arg0: any, arg1: any, callback: NodeStyleCallback<T>) => any) |
    ((arg0: any, arg1: any, arg2: any, callback: NodeStyleCallback<T>) => any) |
    ((arg0: any, arg1: any, arg2: any, arg3: any, callback: NodeStyleCallback<T>) => any) |
    Function;

/**
 * Call a Node.js-style asynchronous function and return a correspondent
 * promise.
 */
export function call<T>(fn: NodeStyleAsyncFunction<T>, ...args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        fn.call(undefined, ...args, (error: any, value: T) => {
            if (error) {
                reject(error);
            } else {
                resolve(value);
            }
        });
    });
}

export type AsyncFunction<T> = (...args: any[]) => Promise<T>;

export function async<T>(fn: NodeStyleAsyncFunction<T>): AsyncFunction<T> {
    return function (this: any, ...args: any[]): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            fn.call(this, ...args, (error: any, value: T) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(value);
                }
            });
        });
    };
}
