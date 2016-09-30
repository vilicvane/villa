import { expect } from 'chai';

import { find } from '../../';

describe('Feature: find', () => {
    it('Should iterate all unmatched values and result in `undefined`', async () => {
        let count = 0;
        let values = [1, 2, 3];

        let result = await find(values, async (value, index, array) => {
            index.should.equal(count++);
            array.should.equal(values);
            return false;
        });

        count.should.equal(values.length);
        expect(result).to.be.undefined;
    });

    it('Should break if any match found and result in the value found', async () => {
        let count = 0;
        let values = [1, 2, 3];

        let result = await find(values, async (value, index, array) => {
            if (value === 2) {
                return true;
            }

            count++;
            return false;
        });

        count.should.equal(1);
        result!.should.equal(2);
    });

    it('Should handle exception', async () => {
        let values = [1, 2, 3];
        let error = new Error('exception');

        let ret = find(values, async (value, index) => {
            if (index === 1) {
                throw error;
            }

            return false;
        });

        await ret.should.be.rejectedWith(error);
    });
});
