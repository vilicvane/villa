import { retry } from '../../';

describe('Feature: retry', () => {
    it('Fulfilled directly', async () => {
        let result = await retry(async (reason, attempts) => {
            attempts.should.equal(0);
            return 'abc';
        });

        result.should.equal('abc');
    });

    it('Rejected twice then succeed', async () => {
        let count = 0;

        let result = await retry((reason, attempts) => {
            count++;

            switch (attempts) {
                case 0:
                    throw new Error();
                case 1:
                    return Promise.reject<string>(new Error());
                default:
                    return 'abc';
            }
        });

        count.should.equal(3);
        result.should.equal('abc');
    });

    it('Exceeding retry limit', async () => {
        let count = 0;

        await retry((reason, attempts) => {
            count++;
            throw new Error(`retry-error-${attempts}`);
        }, {
            limit: 6
        })
        .should.be.rejectedWith('retry-error-5');

        count.should.equal(6);
    });
});
