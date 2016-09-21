import { Resolvable } from './';

/**
 * Create a promise that will be fulfilled in given duration (milliseconds).
 * @param duration Duration in milliseconds before the promise gets fulfilled.
 */
export function sleep(duration: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, duration));
}

export type RetryHandler<TResult> = (lastReason: any, attempts: number) => Resolvable<TResult>;

export interface RetryOptions {
    /** Try limit times (defaults to 3). */
    limit?: number;
    /** Interval between two tries (defaults to 0). */
    interval?: number;
}

/**
 * Retry process in the handler for several times.
 * @param handler Retry handler.
 * @param options Retry options.
 * @return Created promise.
 */
export async function retry<T>(handler: RetryHandler<T>, options: RetryOptions = {}): Promise<T> {
    let {
        limit = 3,
        interval = 0
    } = options;

    let lastError: any;

    for (let i = 0; i < limit; i++) {
        try {
            return await handler(lastError, i);
        } catch (error) {
            lastError = error;
        }

        await sleep(interval);
    }

    throw lastError;
}
