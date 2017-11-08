import {filter} from '../..';

describe('Feature: filter', () => {
  it('Should result in expected array', async () => {
    let count = 0;
    let values = [1, 2, 3];

    let results = await filter(values, async (value, index, array) => {
      index.should.equal(count++);
      array.should.equal(values);
      return value !== 2;
    });

    results.should.deep.equal([1, 3]);
  });

  it('Should handle exception', async () => {
    let values = [1, 2, 3];
    let error = new Error('exception');

    let ret = filter(values, async (_value, index) => {
      if (index === 1) {
        throw error;
      }

      return true;
    });

    await ret.should.be.rejectedWith(error);
  });
});
