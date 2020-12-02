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
  bspOrganizationType,
  otherBSPOrganization,
  producerOrganization,
  producerOrganizationType,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {EDAHelper} from '../helper/EDA.helper';
import {EDA} from '../../src/eda/EDA';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {QueryResponse} from '../common/QueryResponse';
import {query} from 'winston';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const secondEda: EDA = new EDAHelper().createEda(
  'second_eda',
  otherBSPOrganization.organizationId
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(producerOrganizationType.mspId);
  }
);

describe('As PRODUCER ', () => {
  it('I should not be able to create a new EDA.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new EDAMockTransaction(
      mockStub
    ).createEDA(eda, producerOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create an EDA.'
    );
  });

  it('I should not be able to update an EDA.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    eda.edaRegisteredResourceMrid = 'test';
    const invokeResponse: ChaincodeResponse = await new EDAMockTransaction(
      mockStub
    ).updateEDA(eda, producerOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to update ID_EDA.'
    );
  });

  it('I should not be able to get an EDA by ID.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    eda.a46Name = bspOrganization.organizationId;
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getEDAById(
      eda.edaRegisteredResourceId,
      producerOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to get ID_EDA.'
    );
  });

  it('I should not be able to get EDAs when I get all EDAs.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEda,
      tsoOrganization
    );

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getAllEDAs(producerOrganization);
    const retrievedEDAs: EDA[] = JSON.parse(
      JSON.stringify(queryResponse.payload)
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(retrievedEDAs.length).equal(0);
  });

  it('I should not be able to get EDAs when I query all EDAs.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    eda.edaRegisteredResourceMrid = 'code_EDA';
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEda,
      tsoOrganization
    );

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).queryEDAs(
      JSON.stringify({
        edaRegisteredResourceMrid: 'code_EDA'
      }),
      producerOrganization
    );
    const retrievedEDAs: EDA[] = JSON.parse(
      JSON.stringify(queryResponse.payload)
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(retrievedEDAs.length).equal(0);
  });
});
