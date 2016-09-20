import { Resolvable } from './';

let lockObjectToResolvableMapping = new Map<any, Resolvable<any>>();

export type LockHandler<T> = () => Resolvable<T>;

async function innerLock<T>(object: any, handler: LockHandler<T>): Promise<T> {
    try {
        await lockObjectToResolvableMapping.get(object);
    } catch (error) { }

    return await handler();
}

export async function lock<T>(object: any, handler: LockHandler<T>): Promise<T> {
    let ret = innerLock(object, handler);
    lockObjectToResolvableMapping.set(object, ret);
    return await ret;
}
