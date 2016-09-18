import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

type AwaitableCreator<T> = <T>(target: any, ...args: any[]) => Promise<T>;

let awaitableCreators = [] as AwaitableCreator<any>[];

try {
    const ChildProcessConstructor = require('child_process').ChildProcess;

    awaitableCreators.push((process: ChildProcess, ...args: any[]): Promise<void> | undefined => {
        if (!(process instanceof ChildProcessConstructor) || args.length) {
            return undefined;
        }

        return new Promise<void>((resolve, reject) => {
            process.on('exit', onexit);
            process.on('error', onerror);

            function removeListeners() {
                process.removeListener('exit', onexit);
                process.removeListener('error', onerror);
            }

            function onexit(code: number) {
                removeListeners();

                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error('Invalid exit code'));
                }
            }

            function onerror(error: any) {
                setImmediate(removeListeners);
                reject(error);
            }
        });
    });
} catch (error) { }

try {
    const EventEmitterConstructor = require('events').EventEmitter;

    awaitableCreators.push(<T>(emitter: EventEmitter, types: string | string[], errorEmitters: EventEmitter[] = []): Promise<T> | undefined => {
        if (!(emitter instanceof EventEmitterConstructor)) {
            return undefined;
        }

        errorEmitters.unshift(emitter);

        if (typeof types === 'string') {
            types = [types];
        }

        return new Promise<T>((resolve, reject) => {
            for (let type of types as string[]) {
                emitter.on(type, onsuccess);
            }

            for (let emitter of errorEmitters) {
                emitter.on('error', onerror);
            }

            function removeListeners() {
                for (let type of types) {
                    emitter.removeListener(type, onsuccess);
                }

                for (let emitter of errorEmitters) {
                    emitter.removeListener('error', onerror);
                }
            }

            function onsuccess(value: T) {
                removeListeners();
                resolve(value);
            }

            function onerror(error: any) {
                setImmediate(removeListeners);
                reject(error);
            }
        });
    });
} catch (error) { }

/**
 * Create a promise for a `ChildProcess` object.
 * @param process The process to listen on 'exit' and 'error' events for
 *     fulfillment or rejection.
 */
export function awaitable(process: ChildProcess): Promise<void>;
/**
 * Create a promise for an event emitter.
 * @param emitter The emitter to listen on 'error' event for rejection, and
 *     given event types for fulfillment.
 * @param type A string or an array of string of event types for fulfillment.
 * @param errorEmitters Other emitters to listen on 'error' event for
 *     rejection.
 */
export function awaitable(emitter: EventEmitter, types: string | string[], errorEmitters?: EventEmitter[]): Promise<void>;
export function awaitable<T>(emitter: EventEmitter, types: string | string[], errorEmitters?: EventEmitter[]): Promise<T>;
export function awaitable<T>(target: any, ...args: any[]): Promise<T> {
    for (let creator of awaitableCreators) {
        let promise = creator<T>(target, ...args);

        if (promise) {
            return promise;
        }
    }

    throw new TypeError('Cannot create awaitable from the target object with given arguments');
}
