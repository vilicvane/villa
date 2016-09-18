export * from './acall';
export * from './awaitable';

export type NodeStyleCallback<T> = (error?: any, value?: T) => void;
