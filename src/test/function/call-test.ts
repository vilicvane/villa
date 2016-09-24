import { NodeStyleCallback, call } from '../../';

let testValue = {
    value: 'test value'
};

type TestValueType = typeof testValue;

describe('Feature: call', () => {
    it('Should invoke successfully asynchronously', async () => {
        let ret = call((a: number, b: string, callback: NodeStyleCallback<TestValueType>) => {
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

    it('Should invoke successfully synchronously', async () => {
        let ret = call((a: number, b: string, callback: NodeStyleCallback<TestValueType>) => {
            a.should.equal(123);
            b.should.equal('abc');

            callback(undefined, testValue);
        }, 123, 'abc');

        ret.should.be.an.instanceOf(Promise);

        let result = await ret;

        result.should.equal(testValue);
    });

    it('Should invoke failed asynchronously', async () => {
        let ret = call((a: number, b: string, callback: NodeStyleCallback<TestValueType>) => {
            a.should.equal(123);
            b.should.equal('abc');

            setTimeout(callback, 10, new Error('invoke-failure'));
        }, 123, 'abc');

        ret.should.be.an.instanceOf(Promise);

        await ret.should.be.rejectedWith(Error, 'invoke-failure');
    });

    it('Should invoke successfully synchronously', async () => {
        let ret = call((a: number, b: string, callback: NodeStyleCallback<TestValueType>) => {
            a.should.equal(123);
            b.should.equal('abc');

            callback(new Error('invoke-failure'));
        }, 123, 'abc');

        ret.should.be.an.instanceOf(Promise);

        await ret.should.be.rejectedWith(Error, 'invoke-failure');
    });
});
