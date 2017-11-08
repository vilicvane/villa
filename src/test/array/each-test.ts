// tslint:disable:no-unused-expression

import {each} from '../..';

describe('Feature: each', () => {
  it('Should iterate values', async () => {
    let count = 0;
    let values = [1, 2, 3];

    let completed = await each(values, async (_value, index, array) => {
      index.should.equal(count++);
      array.should.equal(values);
    });

    count.should.equal(values.length);
    completed.should.be.true;
  });

  it('Should be interrupted by handler returning `false`', async () => {
    let count = 0;
    let values = [1, 2, 3];

    let completed = await each(values, async (_value, index) => {
      if (index === 1) {
        return false;
      }

      count++;
      return undefined;
    });

    count.should.equal(1);
    completed.should.be.false;
  });

  it('Should handle exception', async () => {
    let values = [1, 2, 3];
    let error = new Error('exception');

    let ret = each(values, async (_value, index) => {
      if (index === 1) {
        throw error;
      }
    });

    await ret.should.be.rejectedWith(error);
  });
});
