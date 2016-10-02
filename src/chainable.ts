import {
    Resolvable,
    Resolver,
    EachHandler,
    EveryHandler,
    FilterHandler,
    FindHandler,
    MapTransformer,
    ParallelHandler,
    RaceTransformer,
    ReduceTransformer,
    SomeHandler,
    each,
    every,
    filter,
    find,
    findIndex,
    map,
    reduce,
    some
} from './';

export class Chainable<T> extends Promise<T[]> {
    each(handler: EachHandler<T>): Promise<boolean> {
        let chainable = this.then(values => each(values, handler));
        return Promise.resolve(chainable);
    }

    every(handler: EveryHandler<T>): Promise<boolean> {
        let chainable = this.then(values => every(values, handler));
        return Promise.resolve(chainable);
    }

    filter(handler: FilterHandler<T>): Chainable<T> {
        return this.then(values => filter(values, handler)) as Chainable<T>;
    }

    find(handler: FindHandler<T>): Promise<T | undefined> {
        let chainable = this.then(values => find(values, handler));
        return Promise.resolve(chainable);
    }

    findIndex(handler: FindHandler<T>): Promise<number> {
        let chainable = this.then(values => findIndex(values, handler));
        return Promise.resolve(chainable);
    }

    map<TResult>(transformer: MapTransformer<T, TResult>, concurrency?: number): Chainable<TResult> {
        return this.then(values => map(values, transformer, concurrency)) as Chainable<TResult>;
    }

    parallel(handler: ParallelHandler<T>, concurrency?: number): Promise<void> {
        let chainable = this.then(values => map(values, handler, concurrency));
        return Promise.resolve(chainable).then(() => undefined);
    }

    race<TResult>(transformer: RaceTransformer<T, TResult>): Promise<TResult> {
        let chainable = this.then(values => Promise.race(values.map(transformer)));
        return Promise.resolve(chainable);
    }

    reduce<TResult>(transformer: ReduceTransformer<T, TResult[]>, initial: TResult[]): Chainable<TResult>;
    reduce<TResult>(transformer: ReduceTransformer<T, TResult>, initial: TResult): Promise<TResult>;
    reduce(transformer: ReduceTransformer<T, T>): Promise<T>;
    reduce(transformer: ReduceTransformer<any, any>, ...args: any[]): Chainable<any> | Promise<any> {
        let chainable = this.then(values => (reduce as Function)(values, transformer, ...args));
        return Array.isArray(args[0]) ? chainable as Chainable<any> : Promise.resolve(chainable);
    }

    some(handler: SomeHandler<T>): Promise<boolean> {
        let chainable = this.then(values => some(values, handler));
        return Promise.resolve(chainable);
    }

    static resolve(): Promise<any>;
    static resolve<T>(resolvable: Resolvable<T[]>): Chainable<T>;
    static resolve<T>(resolvable?: Resolvable<T[]>): Chainable<T> {
        return new Chainable<T>(resolve => resolve(resolvable));
    }
}

/**
 * Wrap given resolvable with a chainable derived of built-in promise.
 */
export function chainable<T>(resolvable: Resolvable<T[]>): Chainable<T> {
    return Chainable.resolve(resolvable);
}
