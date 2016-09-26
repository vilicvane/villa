import {
    Resolvable
} from './';

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

export type MapTransformer<T, TResult> = (value: T, index: number, values: T[]) => Resolvable<TResult>;

export async function map<T, TResult>(values: T[], transformer: MapTransformer<T, TResult>, concurrency?: number): Promise<TResult[]> {
    if (typeof concurrency !== 'number') {
        return Promise.all(values.map(transformer));
    }

    return new Promise<TResult[]>((resolve, reject) => {
        let pending = 0;

        let results = [] as TResult[];

        let i = 0;

        let starting = Math.min(concurrency, values.length);

        if (starting <= 0) {
            resolve(results);
            return;
        }

        while (i < starting) {
            next();
        }

        function next(): void {
            if (i === values.length) {
                if (!pending) {
                    resolve(results);
                }

                return;
            }

            let index = i++;
            let value = values[index];

            pending++;

            let ret: Resolvable<TResult>;

            try {
                ret = transformer(value, index, values);
            } catch (error) {
                reject(error);
                return;
            }

            Promise
                .resolve(ret)
                .then(result => {
                    results[index] = result;
                    pending--;
                    next();
                }, error => {
                    reject(error);
                });
        }
    });
}

export type ReduceTransformer<T, TResult> = (result: TResult, value: T, index: number, values: T[]) => Resolvable<TResult>;

export async function reduce<T, TResult>(values: T[], transformer: ReduceTransformer<T, TResult>, initial: TResult): Promise<TResult>;
export async function reduce<T>(values: T[], transformer: ReduceTransformer<T, T>): Promise<T | undefined>;
export async function reduce<T, TResult>(values: T[], transformer: ReduceTransformer<T, TResult>, ...args: any[]): Promise<TResult | undefined> {
    return (values.reduce as Function)(async (result: TResult, value: T, index: number) => {
        return transformer(await result, value, index, values);
    }, ...args);
}

export type FilterHandler<T> = (value: T, index: number, values: T[]) => Resolvable<boolean>;

export async function filter<T>(values: T[], handler: FilterHandler<T>): Promise<T[]> {
    let results = [] as T[];

    for (let i = 0; i < values.length; i++) {
        let value = values[i];
        if (await handler(value, i, values)) {
            results.push(value);
        }
    }

    return results;
}
