export * from './array';
export * from './awaitable';
export * from './chain';
export * from './concurrency';
export * from './function';
export * from './miscellaneous';

export type Resolvable<T> = PromiseLike<T> | T;
export type Resolver<T> = (resolve: (value?: Resolvable<T>) => void, reject: (reason?: any) => void) => void
export type NodeStyleCallback<T> = (error?: any, value?: T) => void;
