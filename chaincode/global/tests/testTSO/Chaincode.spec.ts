/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Chaincode} from '../../src/Chaincode';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {expect} from 'chai';
import {ChaincodeResponse} from 'fabric-shim';

const chaincode = new Chaincode();

describe('Test Chaincode', () => {
  it('should init without issues', async () => {
    const stub = new ChaincodeMockStub('MyMockStub', chaincode);

    const response: ChaincodeResponse = await stub.mockInit('tx1', []);

    expect(response.status).to.equal(200);
  });
});
