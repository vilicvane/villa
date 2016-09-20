import { lock } from '../../';

describe('Feature: lock', () => {
    it('Should lock', async () => {
        let object = {};

        let flagB = false;
        let flagC = false;

        let retA = lock(object, async () => {
            await new Promise<void>(resolve => setTimeout(resolve, 20));
            flagB.should.be.false;
            return 'foo';
        });

        let retB = lock(object, async () => {
            flagB = true;
            await new Promise<void>(resolve => setTimeout(resolve, 10));
            flagC.should.be.false;
            return 'bar';
        });

        let retC = lock(object, async () => {
            flagC = true;
            return 'pia';
        });

        (await retA).should.equal('foo');
        (await retB).should.equal('bar');
        (await retC).should.equal('pia');
    });

    it('Should handle synchronous exception', async () => {
        let object = {};
        let error = new Error();

        let retA = lock(object, () => {
            throw error;
        });

        let retB = lock(object, async () => {
            await new Promise<void>(resolve => setTimeout(resolve, 10));
            return 'bar';
        });

        await retA.should.be.rejectedWith(error);
        (await retB).should.equal('bar');
    });

    it('Should handle asynchronous exception', async () => {
        let object = {};
        let error = new Error();

        let retA = lock(object, async () => {
            throw error;
        });

        let retB = lock(object, async () => {
            await new Promise<void>(resolve => setTimeout(resolve, 10));
            return 'bar';
        });

        await retA.should.be.rejectedWith(error);
        (await retB).should.equal('bar');
    });
});
