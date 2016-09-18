export * from './acall';
export * from './awaitable';
export * from './sleep';

export type NodeStyleCallback<T> = (error?: any, value?: T) => void;
