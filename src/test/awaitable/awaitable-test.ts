import { EventEmitter } from 'events';
import { spawn } from 'child_process';

import { expect } from 'chai';

import {
    awaitable
} from '../../';

let testError = new Error();

let testValue = {
    value: 'test value'
};

describe('Feature: awaitable', () => {
    context('From `ChildProcess`', () => {
        it('Should fulfill on child process that exits with code 0', async () => {
            let cp = spawn(process.execPath, ['-e', ';']);
            expect(await awaitable(cp)).to.be.undefined;
        });

        it('Should reject on child process that exits with code non-zero', async () => {
            let cp = spawn(process.execPath, ['-e', 'throw new Error();']);
            await awaitable(cp).should.be.rejected;
        });

        it('Should reject on child process that spawns with error', async () => {
            let cp = spawn(`foo-bar-${Math.random()}`);
            await awaitable(cp).should.be.rejected;
        });
    });

    context('From `EventEmitter`', () => {
        it('Should fulfill on single event type to listen', async () => {
            let emitter = new EventEmitter();
            let ret = awaitable(emitter, 'close');

            setImmediate(() => emitter.emit('close'));

            expect(await ret).to.be.undefined;
        });

        it('Should fulfill on single event type to listen with value', async () => {
            let emitter = new EventEmitter();
            let ret = awaitable(emitter, 'close');

            setImmediate(() => emitter.emit('close', testValue));

            expect(await ret).to.equal(testValue);
        });

        it('Should fulfill on multiple event types to listen', async () => {
            let emitter = new EventEmitter();
            let ret = awaitable(emitter, ['end', 'finish']);

            setImmediate(() => emitter.emit('finish'));

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
            await new Promise(resolve => setTimeout(resolve, 10));

            let settled = false;

            ret.then(() => {
                settled = true;
            }, () => {
                settled = true;
            });

            await new Promise(resolve => setTimeout(resolve, 10));

            settled.should.be.false;
        });
    });

    context('Unsupported target', () => {
        it('Should throw `TypeError` for unsupported target', () => {
            (() => awaitable(<any>{})).should.throw(TypeError);
        });
    });
});
