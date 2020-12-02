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
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {EDAHelper} from '../helper/EDA.helper';
import {EDA} from '../../src/eda/EDA';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {QueryResponse} from '../common/QueryResponse';

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
    mockStub = await initAndGetMockStub(bspOrganizationType.mspId);
  }
);

describe('As BSP ', () => {
  it('I should not be able to create a new EDA.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new EDAMockTransaction(
      mockStub
    ).createEDA(eda, bspOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create an EDA.'
    );
  });

  it('I should be able to update an EDA for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    eda.edaRegisteredResourceMrid = 'test';
    const invokeResponse: ChaincodeResponse = await new EDAMockTransaction(
      mockStub
    ).updateEDA(eda, bspOrganization);
    const updatedEDA: EDA = JSON.parse(invokeResponse.payload.toString());

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedEDA.edaRegisteredResourceId).equal(
      eda.edaRegisteredResourceId
    );
    expect(updatedEDA.edaRegisteredResourceMrid).equal('test');
  });

  it('I should not be able to update an EDA for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    eda.a46Name = otherBSPOrganization.organizationId;
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    eda.edaRegisteredResourceMrid = 'test';
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new EDAMockTransaction(
      mockStub
    ).updateEDA(eda, bspOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'BSP Organization is not allowed to update ID_EDA.'
    );
  });

  it('I should be able to get an EDA that is assigned to my organization when I get an EDA by ID.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    eda.a46Name = bspOrganization.organizationId;
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getEDAById(eda.edaRegisteredResourceId, bspOrganization);

    expect(queryResponse.status).equal(200);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(eda));
  });

  it('I should not be able to get an EDA that is assigned to another organization when I get an EDA by ID.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    secondEda.a46Name = otherBSPOrganization.organizationId;
    await new EDAMockTransaction(mockStub).createEDA(
      secondEda,
      tsoOrganization
    );

    mockStub.setCreator(bspOrganizationType.mspId);
    const isErrorExpected = true;
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getEDAById(
      secondEda.edaRegisteredResourceId,
      bspOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(500);
    expect(queryResponse.message.toString()).to.contain(
      `BSP organization has no permission to get ${secondEda.edaRegisteredResourceId}.`
    );
  });

  it('I should be able to get EDAs that is assigned to my organization when I get all EDAs.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEda,
      tsoOrganization
    );

    mockStub.setCreator(bspOrganizationType.mspId);
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getAllEDAs(bspOrganization);
    const retrievedEDAs: EDA[] = JSON.parse(
      JSON.stringify(queryResponse.payload)
    );

    expect(queryResponse.status).equal(200);
    expect(retrievedEDAs.length).equal(1);
    expect(retrievedEDAs[0].edaRegisteredResourceId).equal(
      eda.edaRegisteredResourceId
    );
  });

  it('I should be able to get EDAs that is assigned to my organization when I query all EDAs.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    eda.edaRegisteredResourceMrid = 'code_EDA';
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEda,
      tsoOrganization
    );

    mockStub.setCreator(bspOrganizationType.mspId);
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).queryEDAs(
      JSON.stringify({
        edaRegisteredResourceMrid: 'code_EDA'
      }),
      bspOrganization
    );
    const retrievedEDAs: EDA[] = JSON.parse(
      JSON.stringify(queryResponse.payload)
    );

    expect(queryResponse.status).equal(200);
    expect(retrievedEDAs.length).equal(1);
    expect(retrievedEDAs[0].edaRegisteredResourceId).equal(
      eda.edaRegisteredResourceId
    );
  });
});
