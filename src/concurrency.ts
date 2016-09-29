import {
    Resolvable,
    map
} from './';

let lockObjectToPromiseMapping = new Map<any, Promise<any>>();

export type LockHandler<T> = () => Resolvable<T>;

async function _lock<T>(object: any, handler: LockHandler<T>): Promise<T> {
    try {
        await lockObjectToPromiseMapping.get(object);
    } catch (error) { }

    return handler();
}

/**
 * A simple asynchronous lock that helps queueing operations.
 */
export async function lock<T>(object: any, handler: LockHandler<T>): Promise<T> {
    let ret = _lock(object, handler);
    lockObjectToPromiseMapping.set(object, ret);
    return ret;
}

export type ParallelHandler<T> = (value: T, index: number, values: T[]) => Resolvable<void>;

/**
 * Run tasks in parallel, similar to `v.map` but not mean to transform.
 */
export async function parallel<T>(values: T[], handler: ParallelHandler<T>, concurrency?: number): Promise<void> {
    await map(values, handler, concurrency);
}
