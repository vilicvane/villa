import {sleep} from '../..';

describe('Feature: sleep', () => {
  it('Should create a promise that fulfills in given duration', async () => {
    let timestamp = Date.now();

    await sleep(50);

    let elapsed = Date.now() - timestamp;
    elapsed.should.be.greaterThan(40);
  });
});
