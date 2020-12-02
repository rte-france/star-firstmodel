/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {initAndGetMockStub} from '../common/InitChaincode';
import {
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {EDP} from '../../src/edp/EDP';
import {EDPHelper} from '../helper/EDP.helper';
import {EDPMockTransaction} from '../mockControllers/EDPMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const edp: EDP = new EDPHelper().createEdp('edpRegisteredResourceId', 'siteId');

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should be able to create a new EDP.', async () => {
    const invokeResponse: ChaincodeResponse = await new EDPMockTransaction(
      mockStub
    ).createEDP(edp, tsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(edp));
  });

  it('I should be able to get an edp by Id.', async () => {
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    const queryResponse: QueryResponse<EDP> = await new EDPMockTransaction(
      mockStub
    ).getEDP(edp.edpRegisteredResourceId, tsoOrganization);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(edp));
  });

  it('I should get back an empty response when id does not exist.', async () => {
    const isErrorExpected = true;
    const queryResponse: QueryResponse<EDP> = await new EDPMockTransaction(
      mockStub
    ).getEDP(edp.edpRegisteredResourceId, tsoOrganization, isErrorExpected);

    expect(queryResponse.message.toString()).equal(
      `Error: ${edp.edpRegisteredResourceId} does not exist.`
    );
  });
});
