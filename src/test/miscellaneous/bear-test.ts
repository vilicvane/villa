// tslint:disable:no-unused-expression
// tslint:disable:no-implicit-dependencies

import {expect} from 'chai';

import {bear} from '../..';

describe('Feature: bear', () => {
  it('Should bear error on rejection', async () => {
    let result = await Promise.reject(new Error()).catch(bear);
    expect(result).to.be.undefined;
  });
});
