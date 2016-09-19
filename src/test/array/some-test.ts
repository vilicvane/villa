import { some } from '../../';

describe('Feature: some', () => {
    it('Should iterate all unmatched values and result in `false`', async () => {
        let count = 0;
        let values = [1, 2, 3];

        let result = await some(values, async (value, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);
            return false;
        });

        count.should.equal(values.length);
        result.should.be.false;
    });

    it('Should break if any match found and result in `true`', async () => {
        let count = 0;
        let values = [1, 2, 3];

        let result = await some(values, async (value, index, array) => {
            if (value === 2) {
                return true;
            }

            count++;
            return false;
        });

        count.should.equal(1);
        result.should.be.true;
    });

    it('Should handle exception', async () => {
        let values = [1, 2, 3];
        let error = new Error('exception');

        let ret = some(values, async (value, index) => {
            if (index === 1) {
                throw error;
            }

            return false;
        });

        await ret.should.be.rejectedWith(error);
    });
});
