/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {Chaincode} from '../../src/Chaincode';

export const initAndGetMockStub = async (
  mspId: string
): Promise<ChaincodeMockStub> => {
  let mockStub: ChaincodeMockStub;
  mockStub = new ChaincodeMockStub('MyMockStub', new Chaincode());

  mockStub.setCreator(mspId);

  return mockStub;
};
