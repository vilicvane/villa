import { reduceRight } from '../../';

describe('Feature: reduceRight', () => {
    it('Should reduce from right with simple summation', async () => {
        let values = [1, 2, 3];
        let count = values.length;

        let result = await reduceRight(values, async (previous, current, index, array) => {
            index.should.equal(--count);
            current.should.equal(values[index]);
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
        let values = ['abc', 'def', 'ghi'];
        let count = values.length;

        let result = await reduceRight(values, async (result, value, index, array) => {
            index.should.equal(--count);
            value.should.equal(values[index]);
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

    it('Should reduce from right with no initial value', async () => {
        let values = [1, 2, 3];
        let count = values.length - 1;

        let result = await reduceRight(values, async (previous, current, index, array) => {
            index.should.equal(--count);
            current.should.equal(values[index]);
            array.should.equal(values);

            return previous + current;
        });

        result!.should.equal(6);
    });

    it('Should handle exception', async () => {
        let values = [1, 2, 3];
        let error = new Error('exception');

        let ret = reduceRight(values, async (previous, current, index) => {
            if (index === 1) {
                throw error;
            }

            return previous + current;
        }, 0);

        await ret.should.be.rejectedWith(error);
    });
});
