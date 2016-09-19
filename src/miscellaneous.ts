/**
 * Create a promise that will be fulfilled in given duration (milliseconds).
 * @param duration Duration in milliseconds before the promise gets fulfilled.
 */
export function sleep(duration: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, duration));
}
