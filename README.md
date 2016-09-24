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
both TypeScript and Babel.

```sh
npm install villa --save
```

# Usage Example
```ts
import * as FS from 'fs';
import * as Path from 'fs';
import * as v from 'villa';

async function copy(source, target) {
    let readStream = FS.createReadStream(source);
    let writeStream = FS.createWriteStream(target);
    readStream.pipe(writeStream);
    return v.awaitable(writeStream, 'close', [readStream]);
}

async function copyAll(sourceDir, targetDir) {
    let fileNames = v.call(FS.readdir, sourceDir);

    fileNames = await v.filter(fileNames, async fileName => {
        return (await v.call(FS.stat, fileName)).isFile();
    });

    for (let fileName of fileNames) {
        let source = Path.join(sourceDir, fileName);
        let target = Path.join(targetDir, fileName);
        await copy(source, target);
    }
}
```

# API References

Comming soon.

# License

MIT License.
