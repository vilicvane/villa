import { race } from '../../';

describe('Feature: race', () => {
    it('Should result in the first fulfilled value', async () => {
        let count = 0;
        let values = [20, 10, 30];

        let result = await race(values, async (value, index, array) => {
            index.should.equal(count++);
            value.should.equal(values[index]);
            array.should.equal(values);
            return new Promise<number>(resolve => setTimeout(resolve, value, value / 10));
        });

        result.should.equal(1);
    });

    it('Should handle exception', async () => {
        let values = [1, 2, 3];
        let error = new Error('exception');

        let ret = race(values, async (value, index) => {
            if (index === 1) {
                value.should.equal(values[index]);
                throw error;
            } else {
                return new Promise<void>(resolve => setTimeout(resolve, 0));
            }
        });

        await ret.should.be.rejectedWith(error);
    });
});
