// tslint:disable:unified-signatures

import {ChildProcess} from 'child_process';
import {EventEmitter} from 'events';
import {Readable, Writable} from 'stream';

const {EventEmitter: EventEmitterConstructor} = safeRequire('events');

const {ChildProcess: ChildProcessConstructor} = safeRequire('child_process');

const {
  Readable: ReadableConstructor,
  Writable: WritableConstructor,
} = safeRequire('stream');

import {awaitableCreators} from '../awaitable';

export type EventEmitterResultAssertion<T> = (result: any) => T;

interface EventEmitterAwaitableOptions<T> {
  types: string[];
  assertion?: EventEmitterResultAssertion<T>;
}

function getEventEmitterAwaitableOptions(
  emitter: EventEmitter,
): EventEmitterAwaitableOptions<any> {
  if (ChildProcessConstructor && emitter instanceof ChildProcessConstructor) {
    return {
      types: ['exit'],
      assertion(code: number): void {
        if (code !== 0) {
          throw new Error(`Invalid exit code ${code}`);
        }
      },
    };
  } else if (
    (ReadableConstructor && emitter instanceof ReadableConstructor) ||
    (WritableConstructor && emitter instanceof WritableConstructor)
  ) {
    return {
      types: ['close'],
    };
  } else {
    throw new Error('Missing event types');
  }
}

function eventEmitterAwaitableCreator<T>(
  emitter: EventEmitter,
  types: string | string[],
  errorEmitters?: EventEmitter[],
): Promise<T> | undefined;
function eventEmitterAwaitableCreator<T>(
  emitter: EventEmitter,
  types: string | string[],
  assertion: EventEmitterResultAssertion<T>,
  errorEmitters?: EventEmitter[],
): Promise<T> | undefined;
function eventEmitterAwaitableCreator(
  process: ChildProcess | Readable | Writable,
  errorEmitters?: EventEmitter[],
): Promise<void>;
function eventEmitterAwaitableCreator(
  stream: Readable | Writable,
  errorEmitters?: EventEmitter[],
): Promise<void>;
function eventEmitterAwaitableCreator<T>(
  emitter: EventEmitter,
  types: string | string[] | EventEmitter[] | undefined,
  assertion: EventEmitterResultAssertion<T> | EventEmitter[] | undefined = [],
  errorEmitters?: EventEmitter[] | undefined,
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
      // TODO: possibly a bug of TypeScript 2.2, adding ! temporarily.
      assertion = undefined!;
    }
  } else {
    errorEmitters = types;

    let options = getEventEmitterAwaitableOptions(emitter);

    types = options.types;
    // TODO: possibly a bug of TypeScript 2.2, adding ! temporarily.
    assertion = options.assertion!;
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
    promise = promise.then(assertion);
  }

  return promise;
}

/* istanbul ignore else */
if (EventEmitterConstructor) {
  awaitableCreators.push(eventEmitterAwaitableCreator);
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

declare module '../index' {
  /**
   * Create a promise for an event emitter.
   */
  function awaitable(
    emitter: EventEmitter,
    types: string | string[],
    errorEmitters?: EventEmitter[],
  ): Promise<void>;
  function awaitable<T>(
    emitter: EventEmitter,
    types: string | string[],
    errorEmitters?: EventEmitter[],
  ): Promise<T>;
  function awaitable<T>(
    emitter: EventEmitter,
    types: string | string[],
    assertion: EventEmitterResultAssertion<T>,
    errorEmitters?: EventEmitter[],
  ): Promise<T>;
  /**
   * Create a promise for a `ChildProcess` object.
   * @param process The process to listen on 'exit' and 'error' events for
   *     fulfillment or rejection.
   */
  function awaitable(
    process: ChildProcess,
    errorEmitters?: EventEmitter[],
  ): Promise<void>;
  /**
   * Create a promise for a stream.
   * @param stream The stream to listen on 'close' and 'error' events for
   *     fulfillment or rejection.
   */
  function awaitable(
    stream: Readable | Writable,
    errorEmitters?: EventEmitter[],
  ): Promise<void>;
}
