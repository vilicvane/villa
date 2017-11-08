import {parallel} from '../..';

describe('Feature: parallel', () => {
  it('Should call handler with values', async () => {
    let count = 0;
    let values = [10, 20, 30];

    await parallel(values, async (value, index, array) => {
      index.should.equal(count++);
      value.should.equal(values[index]);
      array.should.equal(values);
    });
  });

  it('Should handle exception', async () => {
    let values = [1, 2, 3];
    let error = new Error('exception');

    let ret = parallel(values, async (value, index) => {
      if (index === 1) {
        value.should.equal(values[index]);
        throw error;
      }
    });

    await ret.should.be.rejectedWith(error);
  });

  it('Should call handler in given concurrency', async () => {
    let processing = 0;
    let count = 0;
    let values = [20, 10, 30, 20, 10];

    await parallel(
      values,
      async (value, index, array) => {
        index.should.equal(count++);
        array.should.equal(values);

        processing++;

        if (index < values.length - 2) {
          processing.should.equal(Math.min(2, index + 1));
        }

        await new Promise<void>(resolve =>
          setTimeout(resolve, value, value / 10),
        );

        processing--;
      },
      2,
    );
  });
});
