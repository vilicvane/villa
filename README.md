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

#### [[+]](/src/function.ts#L29) `async<T>(fn: NodeStyleAsyncFunction<T>): AsyncFunction<T>`

#### [[+]](/src/awaitable.ts#L131) `awaitable(emitter: EventEmitter, types: string | string[], errorEmitters?: EventEmitter[]): Promise<void>` <sup>+4</sup>

##### Overloads

- `awaitable<T>(emitter: EventEmitter, types: string | string[], errorEmitters?: EventEmitter[]): Promise<T>`
- `awaitable<T>(emitter: EventEmitter, types: string | string[], assertion: EventEmitterResultAssertion<T>, errorEmitters?: EventEmitter[]): Promise<T>`
- `awaitable(process: ChildProcess, errorEmitters?: EventEmitter[]): Promise<void>`
- `awaitable(stream: Readable | Writable, errorEmitters?: EventEmitter[]): Promise<void>`

#### [[+]](/src/function.ts#L15) `call<T>(fn: NodeStyleAsyncFunction<T>, ...args: any[]): Promise<T>`

Call a Node.js-style asynchronous function and return a correspondent
promise.

#### [[+]](/src/chainable.ts#L59) `chainable<T>(resolvable: Resolvable<T[]>): Chainable<T>`

#### [[+]](/src/array.ts#L7) `each<T>(values: T[], handler: EachHandler<T>): Promise<boolean>`

#### [[+]](/src/array.ts#L31) `every<T>(values: T[], handler: EveryHandler<T>): Promise<boolean>`

#### [[+]](/src/array.ts#L114) `filter<T>(values: T[], handler: FilterHandler<T>): Promise<T[]>`

#### [[+]](/src/concurrency.ts#L15) `lock<T>(object: any, handler: LockHandler<T>): Promise<T>`

#### [[+]](/src/array.ts#L43) `map<T, TResult>(values: T[], transformer: MapTransformer<T, TResult>, concurrency?: number): Promise<TResult[]>`

#### [[+]](/src/array.ts#L104) `reduce<T, TResult>(values: T[], transformer: ReduceTransformer<T, TResult>, initial: TResult): Promise<TResult>` <sup>+1</sup>

##### Overloads

- `reduce<T>(values: T[], transformer: ReduceTransformer<T, T>): Promise<T>`

#### [[+]](/src/miscellaneous.ts#L26) `retry<T>(handler: RetryHandler<T>, options?: RetryOptions): Promise<T>`

Retry process in the handler for several times.

#### [[+]](/src/miscellaneous.ts#L7) `sleep(duration: number): Promise<void>`

Create a promise that will be fulfilled in given duration (milliseconds).

#### [[+]](/src/array.ts#L19) `some<T>(values: T[], handler: SomeHandler<T>): Promise<boolean>`

<!-- endcheat -->

# License

MIT License.
