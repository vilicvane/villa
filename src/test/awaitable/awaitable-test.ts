// tslint:disable:no-unused-expression
// tslint:disable:no-implicit-dependencies

import {spawn} from 'child_process';
import {EventEmitter} from 'events';
import {Readable, Writable} from 'stream';

import {expect} from 'chai';

import {awaitable} from '../..';

import '../../node';

let testError = new Error();

let testValue = {
  value: 'test value',
};

type TestValueType = typeof testValue;

describe('Feature: awaitable', () => {
  context('From `EventEmitter`', () => {
    it('Should fulfill on single event type to listen', async () => {
      let emitter = new EventEmitter();
      let ret = awaitable(emitter, 'close');

      setImmediate(() => emitter.emit('close'));

      // tslint:disable-next-line:no-void-expression
      expect(await ret).to.be.undefined;
    });

    it('Should fulfill on single event type to listen with value', async () => {
      let emitter = new EventEmitter();
      let ret = awaitable(emitter, 'close');

      setImmediate(() => emitter.emit('close', testValue));

      // tslint:disable-next-line:no-void-expression
      expect(await ret).to.equal(testValue);
    });

    it('Should fulfill on with transformed value', async () => {
      let emitter = new EventEmitter();
      let ret = awaitable(
        emitter,
        'close',
        (result: TestValueType) => result.value,
      );

      setImmediate(() => emitter.emit('close', testValue));

      expect(await ret).to.equal(testValue.value);
    });

    it('Should reject on failed assertion', async () => {
      let emitter = new EventEmitter();
      let ret = awaitable(emitter, 'close', () => {
        throw testError;
      });

      setImmediate(() => emitter.emit('close', testValue));

      await ret.should.be.rejectedWith(testError);
    });

    it('Should fulfill on multiple event types to listen', async () => {
      let emitter = new EventEmitter();
      let ret = awaitable(emitter, ['end', 'finish']);

      setImmediate(() => emitter.emit('finish'));

      // tslint:disable-next-line:no-void-expression
      expect(await ret).to.be.undefined;
    });

    it('Should reject on error event', async () => {
      let emitter = new EventEmitter();
      let ret = awaitable(emitter, 'close');

      setImmediate(() => emitter.emit('error', testError));

      await ret.should.be.rejectedWith(testError);
    });

    it('Should reject on error event emitted by error emitters', async () => {
      let emitter = new EventEmitter();
      let errorEmitter = new EventEmitter();

      let ret = awaitable(emitter, 'close', [errorEmitter]);

      setImmediate(() => errorEmitter.emit('error', testError));

      await ret.should.be.rejectedWith(testError);
    });

    it('Should not fulfill on event emitted by error emitters', async () => {
      let emitter = new EventEmitter();
      let errorEmitter = new EventEmitter();

      let ret = awaitable(emitter, 'close', [errorEmitter]);

      setImmediate(() => errorEmitter.emit('close'));

      // Delay 10 ms.
      await new Promise<void>(resolve => setTimeout(resolve, 10));

      let settled = false;

      ret.then(
        () => {
          settled = true;
        },
        () => {
          settled = true;
        },
      );

      await new Promise<void>(resolve => setTimeout(resolve, 10));

      settled.should.be.false;
    });

    it('Should error because of undefined `types`', () => {
      let emitter = new EventEmitter();
      let errorEmitter = new EventEmitter();

      (() => awaitable(emitter, [errorEmitter] as any)).should.throw(
        'Missing event types',
      );
    });
  });

  context('From `ChildProcess`', () => {
    it('Should fulfill on child process that exits with code 0', async () => {
      let cp = spawn(process.execPath, ['-e', ';']);
      // tslint:disable-next-line:no-void-expression
      expect(await awaitable(cp)).to.be.undefined;
    });

    it('Should reject on child process that exits with code non-zero', async () => {
      let cp = spawn(process.execPath, ['-e', 'throw new Error();']);
      await awaitable(cp).should.be.rejectedWith('Invalid exit code');
    });

    it('Should reject on child process that spawns with error', async () => {
      let cp = spawn(`foo-bar-${Math.random()}`);
      await awaitable(cp).should.be.rejectedWith(/ENOENT/);
    });

    it('Should reject on error event emitted by error emitters', async () => {
      let emitter = spawn(process.execPath, ['-e', ';']);
      let errorEmitter = new EventEmitter();

      let ret = awaitable(emitter, [errorEmitter]);

      setImmediate(() => errorEmitter.emit('error', testError));

      await ret.should.be.rejectedWith(testError);
    });
  });

  context('From `Stream`', () => {
    it('Should fulfill on "close" event of readable stream', async () => {
      let stream = new Readable();
      let ret = awaitable(stream);

      setImmediate(() => stream.emit('close'));

      // tslint:disable-next-line:no-void-expression
      expect(await ret).to.be.undefined;
    });

    it('Should fulfill on "close" event of writable stream', async () => {
      let stream = new Writable();
      let ret = awaitable(stream);

      setImmediate(() => stream.emit('close'));

      // tslint:disable-next-line:no-void-expression
      expect(await ret).to.be.undefined;
    });

    it('Should reject on error event emitted by error emitters', async () => {
      let emitter = new Readable();
      let errorEmitter = new EventEmitter();

      let ret = awaitable(emitter, [errorEmitter]);

      setImmediate(() => errorEmitter.emit('error', testError));

      await ret.should.be.rejectedWith(testError);
    });
  });

  context('Unsupported target', () => {
    it('Should throw `TypeError` for unsupported target', () => {
      (() => awaitable({} as any)).should.throw(TypeError);
    });
  });
});
