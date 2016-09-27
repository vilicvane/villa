[![NPM Package](https://badge.fury.io/js/villa.svg)](https://www.npmjs.com/package/villa)
[![Build Status](https://travis-ci.org/vilic/villa.svg)](https://travis-ci.org/vilic/villa)
[![Coverage Status](https://coveralls.io/repos/github/vilic/villa/badge.svg?branch=master)](https://coveralls.io/github/vilic/villa?branch=master)

# Villa

Villa is a set of promise utilities for `async`-`await`-ready environment.

Promises have been widely used in JavaScript, and there are quite a few fully
featured promise libraries like
[bluebird](https://github.com/petkaantonov/bluebird) and
[Q](https://github.com/kriskowal/q). But with the growing adoption of
`async`/`await` provided by ES-next (via transpilers like
[TypeScript](http://www.typescriptlang.org/) and [Babel](http://babeljs.io/)),
some cretical features provided by those libraries become less relevant.

And there is another problem with third-party promise for code using
`async`/`await`: it could be confusing having different promise instances with
different APIs, while an `async` function always returns native promise object.

While most of the promise use cases so far can be addressed using
`async`/`await` with simple helpers, I created villa with my favorite features
from my own promise library [ThenFail](https://github.com/vilic/thenfail).

# Installation

Villa is written in TypeScript and compiled with TypeScript 2.0, and works with
TypeScript, Babel and ES6 generators.

```sh
npm install villa --save
```

# Usage Example
```ts
import * as FS from 'fs';
import * as Path from 'path';

import * as v from 'villa';

async function copy(source, target) {
    let readStream = FS.createReadStream(source);
    let writeStream = FS.createWriteStream(target);

    readStream.pipe(writeStream);

    await v.awaitable(writeStream, 'close', [readStream]);
}

async function copyAll(sourceDir, targetDir) {
    await v
        .chainable(v.call(FS.readdir, sourceDir))
        .filter(async fileName => {
            let stats = await v.call(FS.stat, fileName);
            return stats.isFile();
        })
        .each(async fileName => {
            let source = Path.join(sourceDir, fileName);
            let target = Path.join(targetDir, fileName);
            await copy(source, target);
        });
}
```

# API References

<!-- docheat:functions -->

#### [[+]](/src/awaitable.ts#L134) `awaitable(emitter: EventEmitter, types: string | string[], errorEmitters?: EventEmitter[]): Promise<void>`<sup>+4</sup>

Create a promise for an event emitter.

##### Overloads:

- `awaitable<T>(emitter: EventEmitter, types: string | string[], errorEmitters?: EventEmitter[]): Promise<T>`
- `awaitable<T>(emitter: EventEmitter, types: string | string[], assertion: EventEmitterResultAssertion<T>, errorEmitters?: EventEmitter[]): Promise<T>`
- `awaitable(process: ChildProcess, errorEmitters?: EventEmitter[]): Promise<void>`
- `awaitable(stream: Readable | Writable, errorEmitters?: EventEmitter[]): Promise<void>`

#### [[+]](/src/chainable.ts#L62) `chainable<T>(resolvable: Resolvable<T[]>): Chainable<T>`

Wrap given resolvable with a chainable derived of built-in promise.

#### [[+]](/src/concurrency.ts#L18) `lock<T>(object: any, handler: LockHandler<T>): Promise<T>`

A simple asynchronous lock that helps queueing operations.

#### [[+]](/src/function.ts#L15) `call<T>(fn: NodeStyleAsyncFunction<T>, ...args: any[]): Promise<T>`

Call a Node.js-style asynchronous function and return a correspondent
promise.

#### [[+]](/src/function.ts#L33) `async<T>(fn: NodeStyleAsyncFunction<T>): AsyncFunction<T>`

Wrap a Node.js-style asynchronous function to a function that returns
promise.

#### [[+]](/src/miscellaneous.ts#L7) `sleep(duration: number): Promise<void>`

Create a promise that will be fulfilled in given duration (milliseconds).

#### [[+]](/src/miscellaneous.ts#L26) `retry<T>(handler: RetryHandler<T>, options?: RetryOptions): Promise<T>`

Retry procedure in the handler for several times.

#### [[+]](/src/array.ts#L10) `each<T>(values: T[], handler: EachHandler<T>): Promise<boolean>`

Asynchronous version of `Array#forEach()`.

#### [[+]](/src/array.ts#L25) `some<T>(values: T[], handler: SomeHandler<T>): Promise<boolean>`

Asynchronous version of `Array#some()`.

#### [[+]](/src/array.ts#L40) `every<T>(values: T[], handler: EveryHandler<T>): Promise<boolean>`

Asynchronous version of `Array#every()`.

#### [[+]](/src/array.ts#L55) `map<T, TResult>(values: T[], transformer: MapTransformer<T, TResult>, concurrency?: number): Promise<TResult[]>`

Asynchronous version of `Array#map()` with basic concurrency control.

#### [[+]](/src/array.ts#L119) `reduce<T, TResult>(values: T[], transformer: ReduceTransformer<T, TResult>, initial: TResult): Promise<TResult>`<sup>+1</sup>

Asynchronous version of `Array#reduce()`.

##### Overloads:

- `reduce<T>(values: T[], transformer: ReduceTransformer<T, T>): Promise<T>`

#### [[+]](/src/array.ts#L132) `filter<T>(values: T[], handler: FilterHandler<T>): Promise<T[]>`

Asynchronous version of `Array#filter()`.

<!-- endcheat -->

# License

MIT License.
