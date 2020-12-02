/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {initAndGetMockStub} from '../common/InitChaincode';
import {
  bspOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {EDAHelper} from '../helper/EDA.helper';
import {EDA} from '../../src/eda/EDA';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should be able to create a new EDA.', async () => {
    const invokeResponse: ChaincodeResponse = await new EDAMockTransaction(
      mockStub
    ).createEDA(eda, tsoOrganization);

    expect(invokeResponse.status).equal(200);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(eda));
  });

  it('I should be able to get an EDA by Id.', async () => {
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getEDAById(eda.edaRegisteredResourceId, tsoOrganization);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(eda));
  });

  it('I should get back an empty response when id does not exist.', async () => {
    const isErrorExpected = true;
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getEDAById(eda.edaRegisteredResourceId, tsoOrganization, isErrorExpected);

    expect(queryResponse.message.toString()).to.contain(
      `Error: ${eda.edaRegisteredResourceId} does not exist.`
    );
  });
});
