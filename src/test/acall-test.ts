import { acall, NodeStyleCallback } from '../';

let testValue = {
    value: 'test value'
};

type TestValueType = typeof testValue;

describe('Feature: acall', () => {
    context('Successful invocation', () => {
        it('Invoke successfully asynchronously', async () => {
            let ret = acall<TestValueType>((a: number, b: string, callback: NodeStyleCallback<TestValueType>) => {
                a.should.equal(123);
                b.should.equal('abc');

                setTimeout(callback, 10, undefined, testValue);
            }, 123, 'abc');

            ret.should.be.an.instanceOf(Promise);

            let result = await ret;

            // Should compile.
            result.value;

            result.should.equal(testValue);
        });

        it('Invoke successfully synchronously', async () => {
            let ret = acall<TestValueType>((a: number, b: string, callback: NodeStyleCallback<TestValueType>) => {
                a.should.equal(123);
                b.should.equal('abc');

                callback(undefined, testValue);
            }, 123, 'abc');

            ret.should.be.an.instanceOf(Promise);

            let result = await ret;

            result.should.equal(testValue);
        });
    });

    context('Failed invocation', () => {
        it('Invoke failed asynchronously', async () => {
            let ret = acall<TestValueType>((a: number, b: string, callback: NodeStyleCallback<TestValueType>) => {
                a.should.equal(123);
                b.should.equal('abc');

                setTimeout(callback, 10, new Error('invoke-failure'));
            }, 123, 'abc');

            ret.should.be.an.instanceOf(Promise);

            await ret.should.be.rejectedWith(Error, 'invoke-failure');
        });

        it('Invoke successfully synchronously', async () => {
            let ret = acall<TestValueType>((a: number, b: string, callback: NodeStyleCallback<TestValueType>) => {
                a.should.equal(123);
                b.should.equal('abc');

                callback(new Error('invoke-failure'));
            }, 123, 'abc');

            ret.should.be.an.instanceOf(Promise);

            await ret.should.be.rejectedWith(Error, 'invoke-failure');
        });
    });
});
