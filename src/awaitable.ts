import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { Readable, Writable } from 'stream';

const {
    EventEmitter: EventEmitterConstructor
} = safeRequire('events');

const {
    ChildProcess: ChildProcessConstructor
} = safeRequire('child_process');

const {
    Readable: ReadableConstructor,
    Writable: WritableConstructor
} = safeRequire('stream');

type AwaitableCreator<T> = <T>(target: any, ...args: any[]) => Promise<T> | undefined;

let awaitableCreators = [] as AwaitableCreator<any>[];

export type EventEmitterResultAssertion<T> = (result: any) => T;

interface EventEmitterAwaitableOptions<T> {
    types: string[];
    assertion?: EventEmitterResultAssertion<T>;
}

function getEventEmitterAwaitableOptions(emitter: EventEmitter): EventEmitterAwaitableOptions<any> {
    if (ChildProcessConstructor && emitter instanceof ChildProcessConstructor) {
        return {
            types: ['exit'],
            assertion(code: number): void {
                if (code !== 0) {
                    throw new Error(`Invalid exit code ${code}`);
                }
            }
        };
    } else if (ReadableConstructor && emitter instanceof ReadableConstructor) {
            return {
            types: ['end', 'close']
        };
    } else if (WritableConstructor && emitter instanceof WritableConstructor) {
        return {
            types: ['finish', 'close']
        };
    } else {
        throw new Error('Missing event types');
    }
}

function eventEmitterAwaitableCreator(process: ChildProcess, errorEmitters?: EventEmitter[]): Promise<void>;
function eventEmitterAwaitableCreator(stream: Readable, errorEmitters?: EventEmitter[]): Promise<void>;
function eventEmitterAwaitableCreator(stream: Writable, errorEmitters?: EventEmitter[]): Promise<void>;
function eventEmitterAwaitableCreator<T>(emitter: EventEmitter, types: string | string[], errorEmitters?: EventEmitter[]): Promise<T> | undefined;
function eventEmitterAwaitableCreator<T>(emitter: EventEmitter, types: string | string[], assertion: EventEmitterResultAssertion<T>, errorEmitters?: EventEmitter[]): Promise<T> | undefined;
function eventEmitterAwaitableCreator<T>(
    emitter: EventEmitter,
    types: string | string[] | EventEmitter[] | undefined,
    assertion: EventEmitterResultAssertion<T> | EventEmitter[] | undefined = [],
    errorEmitters?: EventEmitter[] | undefined
): Promise<T> | undefined {
    if (!(emitter instanceof EventEmitterConstructor)) {
        return undefined;
    }

    if (typeof types === 'string' || isStringArray(types)) {
        if (typeof types === 'string') {
            types = [types];
        }

        if (Array.isArray(assertion)) {
            errorEmitters = assertion;
            assertion = undefined;
        }
    } else {
        errorEmitters = types as EventEmitter[] | undefined;

        let options = getEventEmitterAwaitableOptions(emitter);

        types = options.types;
        assertion = options.assertion;
    }

    if (!errorEmitters) {
        errorEmitters = [];
    }

    errorEmitters.unshift(emitter);

    let promise = new Promise<any>((resolve, reject) => {
        for (let type of types as string[]) {
            emitter.on(type, onsuccess);
        }

        for (let emitter of errorEmitters!) {
            emitter.on('error', onerror);
        }

        function removeListeners() {
            for (let type of types as string[]) {
                emitter.removeListener(type, onsuccess);
            }

            for (let emitter of errorEmitters!) {
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

    if (assertion) {
        promise = promise.then(assertion as EventEmitterResultAssertion<T>);
    }

    return promise;
}

/* istanbul ignore else */
if (EventEmitterConstructor) {
    awaitableCreators.push(eventEmitterAwaitableCreator);
}

/**
 * Create a promise for a `ChildProcess` object.
 * @param process The process to listen on 'exit' and 'error' events for
 *     fulfillment or rejection.
 */
export function awaitable(process: ChildProcess): Promise<void>;
/**
 * Create a promise for a `Readable` stream.
 * @param stream The stream to listen on 'end', 'close' and 'error' events for
 *     fulfillment or rejection.
 */
export function awaitable(stream: Readable): Promise<void>;
/**
 * Create a promise for a `Writable` stream.
 * @param stream The stream to listen on finish', 'close' and 'error' events
 *     for fulfillment or rejection.
 */
export function awaitable(stream: Writable): Promise<void>;
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
export function awaitable<T>(emitter: EventEmitter, types: string | string[], assertion: EventEmitterResultAssertion<T>, errorEmitters?: EventEmitter[]): Promise<T>;
export function awaitable<T>(target: any, ...args: any[]): Promise<T> {
    for (let creator of awaitableCreators) {
        let promise = creator<T>(target, ...args);

        if (promise) {
            return promise;
        }
    }

    throw new TypeError('Cannot create awaitable from the target object with given arguments');
}

function safeRequire(id: string): any {
    try {
        return require(id);
    } catch (error) {
        /* istanbul ignore next */
        return {};
    }
}

function isStringArray(object: any): object is string[] {
    return Array.isArray(object) && typeof object[0] === 'string';
}
