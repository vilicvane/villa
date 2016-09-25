import { chain, Chainable } from '../../';

describe('Feature: chain', () => {
    it('Should work with `filter` and `map`', async () => {
        let ret = chain([1, 2, 3])
            .filter(async value => value !== 2)
            .map(async value => value * 2);

        ret.should.be.an.instanceOf(Chainable);
        (await ret).should.deep.equal([2, 6]);
    });

    it('Should work with `reduce` and `each`', async () => {
        let sum = 0;
        let ret = chain([[1], [2, 3], [4, 5, 6]])
            .reduce<number>(async (flatten, values) => flatten.concat(values), [])
            .each(async value => { sum += value; });

        ret.should.not.be.an.instanceOf(Chainable);
        (await ret).should.be.true;
        sum.should.equal(21);
    });

    it('Should work with `reduce` that results in a non-array value', async () => {
        let ret = chain([1, 2, 3])
            .reduce<number>(async (sum, value) => sum + value, 0);

        ret.should.not.be.an.instanceOf(Chainable);
        (await ret).should.equal(6);
    });

    it('Should work with `map` and `every`', async () => {
        let count = 0;
        let ret = chain([1, 2, 3])
            .map(async value => value * 2)
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
        let ret = chain([1, 2, 3])
            .filter(async value => value !== 2)
            .some(async value => {
                count++;
                return value === 3;
            });

        (await ret).should.be.true;
        ret.should.not.be.an.instanceOf(Chainable);
        count.should.equal(2);
    });
});
