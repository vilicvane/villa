import {Resolvable} from '.';

/**
 * A no-operation function that acts as the rejection handler of a promise.
 */
export function bear(_error: any): undefined {
  return;
}

/**
 * Create a promise that will be fulfilled in given duration (milliseconds).
 * @param duration Duration in milliseconds before the promise gets fulfilled.
 */
export function sleep(duration: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, duration));
}

export type RetryHandler<TResult> = (
  lastReason: any,
  attempts: number,
) => Resolvable<TResult>;

export interface RetryOptions {
  /** Try limit times (defaults to 3). */
  limit?: number;
  /** Interval between two tries (defaults to 0). */
  interval?: number;
}

/**
 * Retry procedure in the handler for several times.
 * @param handler Retry handler.
 * @param options Retry options.
 * @return Created promise.
 */
export async function retry<T>(
  handler: RetryHandler<T>,
  options: RetryOptions = {},
): Promise<T> {
  let {limit = 3, interval = 0} = options;

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

export type BatchSchedulerHandler<T> = (tasks: T[]) => Resolvable<void>;

/**
 * BatchScheduler provides the ability to handle tasks scheduled within a time
 * span in batch.
 */
export class BatchScheduler<T> {
  private tasks: T[] = [];

  private batchPromise: Promise<void> | undefined;

  /**
   * Construct a BatchScheduler instance.
   *
   * @param handler A batch handler for the tasks put together.
   * @param timeBeforeStart The time span within which tasks would be handled
   * in batch.
   */
  constructor(
    private handler: BatchSchedulerHandler<T>,
    private timeBeforeStart?: number,
  ) {}

  /** Schedule a task. */
  async schedule(task: T): Promise<void> {
    this.tasks.push(task);

    if (!this.batchPromise) {
      this.batchPromise = (this.timeBeforeStart
        ? sleep(this.timeBeforeStart)
        : Promise.resolve()
      ).then(() => {
        let tasks = this.tasks;

        this.tasks = [];
        this.batchPromise = undefined;

        return this.handler(tasks);
      });
    }

    return this.batchPromise;
  }
}
