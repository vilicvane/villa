// tslint:disable:no-unused-expression
// tslint:disable:no-implicit-dependencies

import {expect} from 'chai';

import {Chainable, chainable} from '../..';

describe('Feature: chainable', () => {
  it('Should work with `filter` and `map`', async () => {
    let ret = chainable([1, 2, 3])
      .filter(async value => value !== 2)
      .map(async value => value * 2);

    ret.should.be.an.instanceOf(Chainable);
    (await ret).should.deep.equal([2, 6]);
  });

  it('Should work with `reduce` and `each`', async () => {
    let sum = 0;
    let ret = chainable([[1], [2, 3], [4, 5, 6]])
      .reduce<number>(async (flatten, values) => flatten.concat(values), [])
      .each(async value => {
        sum += value;
      });

    ret.should.not.be.an.instanceOf(Chainable);
    (await ret).should.be.true;
    sum.should.equal(21);
  });

  it('Should work with `reduce` that results in a non-array value', async () => {
    let ret = chainable([1, 2, 3]).reduce<number>(
      async (sum, value) => sum + value,
      0,
    );

    ret.should.not.be.an.instanceOf(Chainable);
    (await ret).should.equal(6);
  });

  it('Should work with `reduce` that has no initial value', async () => {
    let ret = chainable([1, 2, 3]).reduce(async (sum, value) => sum + value);

    ret.should.not.be.an.instanceOf(Chainable);
    (await ret).should.equal(6);
  });

  it('Should work with `reduceRight` and `each`', async () => {
    let sum = 0;
    let values = [[1], [2, 3], [4, 5, 6]];
    let count = values.length;
    let ret = chainable(values)
      .reduceRight<number>(async (flatten, values, index) => {
        index.should.equal(--count);
        return flatten.concat(values);
      }, [])
      .each(async value => {
        sum += value;
      });

    ret.should.not.be.an.instanceOf(Chainable);
    (await ret).should.be.true;
    sum.should.equal(21);
  });

  it('Should work with `reduceRight` that results in a non-array value', async () => {
    let ret = chainable([1, 2, 3]).reduceRight<number>(
      async (sum, value) => sum + value,
      0,
    );

    ret.should.not.be.an.instanceOf(Chainable);
    (await ret).should.equal(6);
  });

  it('Should work with `reduceRight` that has no initial value', async () => {
    let ret = chainable([1, 2, 3]).reduceRight(
      async (sum, value) => sum + value,
    );

    ret.should.not.be.an.instanceOf(Chainable);
    (await ret).should.equal(6);
  });

  it('Should work with `map` (with concurrency limit) and `every`', async () => {
    let count = 0;
    let processing = 0;
    let ret = chainable([1, 2, 3])
      .map(async value => {
        processing++;

        processing.should.be.lte(2);

        return new Promise<number>(resolve => {
          setTimeout(() => {
            processing--;
            resolve(value * 2);
          }, 10);
        });
      }, 2)
      .every(async value => {
        count++;
        return value % 2 === 0;
      });

    ret.should.not.be.an.instanceOf(Chainable);
    (await ret).should.be.true;
    count.should.equal(3);
  });

  it('Should work with `filter` and `some`', async () => {
    let count = 0;
    let ret = chainable([1, 2, 3])
      .filter(async value => value !== 2)
      .some(async value => {
        count++;
        return value === 3;
      });

    (await ret).should.be.true;
    ret.should.not.be.an.instanceOf(Chainable);
    count.should.equal(2);
  });

  it('Should work with `filter` and `parallel`', async () => {
    let count = 0;
    let sum = 0;
    let ret = chainable([1, 2, 3])
      .filter(async value => !!(value % 2))
      .parallel(async value => {
        count++;
        sum += value;
      });

    // tslint:disable-next-line:no-void-expression
    expect(await ret).to.be.undefined;
    ret.should.not.be.an.instanceOf(Chainable);
    count.should.equal(2);
    sum.should.equal(4);
  });

  it('Should work with `map` and `parallel` (with concurrency limit)', async () => {
    let count = 0;
    let processing = 0;
    let ret = chainable([1, 2, 3])
      .map(async value => value + 1)
      .parallel(async () => {
        count++;
        processing++;

        processing.should.be.lte(2);

        return new Promise<void>(resolve => {
          setTimeout(() => {
            processing--;
            resolve();
          }, 10);
        });
      }, 2);

    // tslint:disable-next-line:no-void-expression
    expect(await ret).to.be.undefined;
    ret.should.not.be.an.instanceOf(Chainable);
    count.should.equal(3);
  });

  it('Should work with `race`', async () => {
    let count = 0;
    let ret = chainable([2, 1, 3]).race(async value => {
      count++;
      return new Promise<string>(resolve =>
        setTimeout(resolve, value * 10, `n${value}`),
      );
    });

    (await ret).should.equal('n1');
    ret.should.not.be.an.instanceOf(Chainable);
    count.should.equal(3);
  });

  it('Should work with `find`', async () => {
    let count = 0;
    let ret = chainable([1, 2, 3]).find(async value => {
      count++;
      return value === 2;
    });

    (await ret)!.should.equal(2);
    ret.should.not.be.an.instanceOf(Chainable);
    count.should.equal(2);
  });

  it('Should work with `findIndex`', async () => {
    let count = 0;
    let ret = chainable([1, 2, 3]).findIndex(async value => {
      count++;
      return value === 2;
    });

    (await ret).should.equal(1);
    ret.should.not.be.an.instanceOf(Chainable);
    count.should.equal(2);
  });
});
