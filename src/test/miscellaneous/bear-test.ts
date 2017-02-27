import { expect } from 'chai';

import { bear } from '../../';

describe('Feature: bear', () => {
    it('Should bear error on rejection', async () => {
        let result = await Promise.reject(new Error()).catch(bear);
        expect(result).to.be.undefined;
    });
});
