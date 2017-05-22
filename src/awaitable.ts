type AwaitableCreator<T> = <T>(target: any, ...args: any[]) => Promise<T> | undefined;

/** @internal */
export const awaitableCreators = [] as AwaitableCreator<any>[];

/**
 * Create a promise for an object.
 * @param emitter The emitter to listen on 'error' event for rejection, and
 *     given event types for fulfillment.
 * @param type A string or an array of string of event types for fulfillment.
 * @param errorEmitters Other emitters to listen on 'error' event for
 *     rejection.
 */
export function awaitable<T>(target: any, ...args: any[]): Promise<T> {
    for (let creator of awaitableCreators) {
        let promise = creator<T>(target, ...args);

        if (promise) {
            return promise;
        }
    }

    throw new TypeError('Cannot create awaitable from the target object with given arguments');
}
