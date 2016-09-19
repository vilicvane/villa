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
});
