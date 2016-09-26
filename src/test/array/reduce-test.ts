import { reduce } from '../../';

describe('Feature: reduce', () => {
    it('Should reduce with simple summation', async () => {
        let count = 0;
        let values = [1, 2, 3];

        let result = await reduce(values, async (previous, current, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);

            return previous + current;
        }, 0);

        result.should.equal(6);
    });

    it('Should return expected result', async () => {
        interface Set {
            [key: string]: boolean;
        }

        let set = {} as Set;
        let count = 0;
        let values = ['abc', 'def', 'ghi'];

        let result = await reduce(values, async (result, value, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);

            result[value] = true;
            return result;
        }, set);

        result.should.deep.equal({
            abc: true,
            def: true,
            ghi: true
        });
    });

    it('Should reduce with no initial value', async () => {
        let count = 1;
        let values = [1, 2, 3];

        let result = await reduce(values, async (previous, current, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);

            return previous + current;
        });

        result!.should.equal(6);
    });

    it('Should handle exception', async () => {
        let values = [1, 2, 3];
        let error = new Error('exception');

        let ret = reduce(values, async (previous, current, index) => {
            if (index === 1) {
                throw error;
            }

            return previous + current;
        }, 0);

        await ret.should.be.rejectedWith(error);
    });
});
