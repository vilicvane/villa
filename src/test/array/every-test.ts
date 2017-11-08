// tslint:disable:no-unused-expression

import {every} from '../..';

describe('Feature: every', () => {
  it('Should iterate all if all values match and result in `true`', async () => {
    let count = 0;
    let values = [1, 2, 3];

    let result = await every(values, async (_value, index, array) => {
      index.should.equal(count++);
      array.should.equal(values);
      return true;
    });

    count.should.equal(values.length);
    result.should.be.true;
  });

  it('Should break if any unmatched found and result in `false`', async () => {
    let count = 0;
    let values = [1, 2, 3];

    let result = await every(values, async value => {
      if (value === 2) {
        return false;
      }

      count++;
      return true;
    });

    count.should.equal(1);
    result.should.be.false;
  });

  it('Should handle exception', async () => {
    let values = [1, 2, 3];
    let error = new Error('exception');

    let ret = every(values, async (_value, index) => {
      if (index === 1) {
        throw error;
      }

      return true;
    });

    await ret.should.be.rejectedWith(error);
  });
});
