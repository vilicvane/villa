import { Resolvable } from './';

let lockObjectToPromiseMapping = new Map<any, Promise<any>>();

export type LockHandler<T> = () => Resolvable<T>;

async function _lock<T>(object: any, handler: LockHandler<T>): Promise<T> {
    try {
        await lockObjectToPromiseMapping.get(object);
    } catch (error) { }

    return await handler();
}

export async function lock<T>(object: any, handler: LockHandler<T>): Promise<T> {
    let ret = _lock(object, handler);
    lockObjectToPromiseMapping.set(object, ret);
    return await ret;
}
