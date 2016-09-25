import { map } from '../../';

describe('Feature: map', () => {
    it('Should result in expected array', async () => {
        let count = 0;
        let values = [10, 20, 30];

        let results = await map(values, async (value, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);
            return value / 10;
        });

        results.should.deep.equal([1, 2, 3]);
    });

    it('Should handle exception', async () => {
        let values = [1, 2, 3];
        let error = new Error('exception');

        let ret = map(values, async (value, index) => {
            if (index === 1) {
                throw error;
            }
        });

        await ret.should.be.rejectedWith(error);
    });

    it('Should transform in given concurrency', async () => {
        let processing = 0;
        let count = 0;
        let values = [20, 10, 30, 20, 10];

        let results = await map(values, async (value, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);

            processing++;

            if (index < values.length - 2) {
                processing.should.equal(Math.min(2, index + 1));
            }

            let result = await new Promise<void>(resolve => setTimeout(resolve, value, value / 10));

            processing--;

            return result;
        }, 2);

        results.should.deep.equal([2, 1, 3, 2, 1]);
    });

    it('Should handle values with length that is less than given concurrency', async () => {
        let processing = 0;
        let count = 0;
        let values = [20, 10, 30, 20, 10];

        let results = await map(values, async (value, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);

            processing++;

            processing.should.equal(count);

            let result = await new Promise<void>(resolve => setTimeout(resolve, value, value / 10));

            processing--;

            return result;
        }, 10);

        results.should.deep.equal([2, 1, 3, 2, 1]);
    });

    it('Should handle empty values array', async () => {
        let values = [] as number[];

        let results = await map(values, async (value, index, array) => {
            return 0;
        }, 2);

        results.should.deep.equal([]);
    });

    it('Should handle synchronous exception with concurrency limit', async () => {
        let values = [0];
        let error = new Error();

        await map(values, () => {
            throw error;
        }, 2)
        .should.be.rejectedWith(error);
    });

    it('Should handle asynchronous exception with concurrency limit', async () => {
        let values = [0];
        let error = new Error();

        await map(values, async () => {
            throw error;
        }, 2)
        .should.be.rejectedWith(error);
    });
});
