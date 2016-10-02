import { expect } from 'chai';

import { findIndex } from '../../';

describe('Feature: findIndex', () => {
    it('Should iterate all unmatched values and result in `-1`', async () => {
        let count = 0;
        let values = [1, 2, 3];

        let result = await findIndex(values, async (value, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);
            return false;
        });

        count.should.equal(values.length);
        result.should.equal(-1);
    });

    it('Should break if any match found and result in the index of matching value', async () => {
        let count = 0;
        let values = [1, 2, 3];

        let result = await findIndex(values, async (value, index, array) => {
            if (value === 2) {
                return true;
            }

            count++;
            return false;
        });

        count.should.equal(1);
        result.should.equal(1);
    });

    it('Should handle exception', async () => {
        let values = [1, 2, 3];
        let error = new Error('exception');

        let ret = findIndex(values, async (value, index) => {
            if (index === 1) {
                throw error;
            }

            return false;
        });

        await ret.should.be.rejectedWith(error);
    });
});
