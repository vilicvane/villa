export * from './array';
export * from './awaitable';
export * from './concurrency';
export * from './function';
export * from './miscellaneous';

export type Resolvable<T> = PromiseLike<T> | T;
export type NodeStyleCallback<T> = (error?: any, value?: T) => void;
