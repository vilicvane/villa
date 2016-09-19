import {
    Resolvable
} from './';

export type MapTransformer<T, TResult> = (value: T, index: number, values: T[]) => Resolvable<TResult>;

/**
 * Asynchronous version of `Array.prototype.map`.
 */
export async function map<T, TResult>(values: T[], transformer: MapTransformer<T, TResult>): Promise<TResult[]> {
    return await Promise.all(values.map(transformer));
}

export type ReduceTransformer<T, TResult> = (result: TResult, value: T, index: number, values: T[]) => Resolvable<TResult>;

export async function reduce<T, TResult>(values: T[], transformer: ReduceTransformer<T, TResult>, initial?: TResult): Promise<TResult> {
    return await values.reduce(async (result, value, index) => {
        return await transformer(await result, value, index, values);
    }, initial as Resolvable<TResult>);
}

export type EachHandler<T> = (value: T, index: number, values: T[]) => Resolvable<void | boolean>;

export async function each<T>(values: T[], handler: EachHandler<T>): Promise<boolean> {
    for (let i = 0; i < values.length; i++) {
        if (await handler(values[i], i, values) === false) {
            return false;
        }
    }

    return true;
}

export type SomeHandler<T> = (value: T, index: number, values: T[]) => Resolvable<boolean>;

export async function some<T>(values: T[], handler: SomeHandler<T>): Promise<boolean> {
    for (let i = 0; i < values.length; i++) {
        if (await handler(values[i], i, values)) {
            return true;
        }
    }

    return false;
}

export type EveryHandler<T> = (value: T, index: number, values: T[]) => Resolvable<boolean>;

export async function every<T>(values: T[], handler: EveryHandler<T>): Promise<boolean> {
    for (let i = 0; i < values.length; i++) {
        if (!await handler(values[i], i, values)) {
            return false;
        }
    }

    return true;
}
