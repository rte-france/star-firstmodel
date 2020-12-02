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
  dsoOrganization,
  dsoOrganizationType,
  otherBSPOrganization,
  otherDSOOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {StatusCode} from '../enums/StatusCode';
import {MVMockTransaction} from '../mockControllers/MVMockTransaction';
import {MV} from '../../src/MV/MV';
import {MVHelper} from '../helper/MV.helper';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const mv: MV = new MVHelper().createMV('idMV', 'siteId');
const mv2: MV = new MVHelper().createMV('idMV2', 'siteId2');
const mvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.MV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const mvSite2: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.MV,
  'ID_EDA2',
  dsoOrganization.organizationId
);
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const eda2: EDA = new EDAHelper().createEda(
  'ID_EDA2',
  otherBSPOrganization.organizationId
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(bspOrganizationType.mspId);
  }
);

describe('As BSP ', () => {
  it('I should not be able to create a new MV.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).createMV(mv, bspOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create MV.'
    );
  });

  it('I should be able to update a comptage MV for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new MVMockTransaction(mockStub).createMV(mv, dsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    mv.resolution = 5;
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).updateMV(mv, bspOrganization);
    const updatedMV: MV = JSON.parse(invokeResponse.payload.toString());

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedMV.energyAccountMarketDocumentMrid).equal(
      mv.energyAccountMarketDocumentMrid
    );
    expect(updatedMV.resolution).equal(5);
  });

  it('I should not be able to update a comptage MV for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );
    await new MVMockTransaction(mockStub).createMV(mv2, otherDSOOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).updateMV(mv2, bspOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have permission to update MV.'
    );
  });

  it('I should be able to get a comptage MV for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new MVMockTransaction(mockStub).createMV(mv, dsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const queryResponse: QueryResponse<MV> = await new MVMockTransaction(
      mockStub
    ).getMVById(mv.energyAccountMarketDocumentMrid, bspOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(mv));
  });

  it('I should not be able to get a comptage MV for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );
    await new MVMockTransaction(mockStub).createMV(mv2, otherDSOOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const isErrorExpected = true;
    const queryResponse: QueryResponse<MV> = await new MVMockTransaction(
      mockStub
    ).getMVById(
      mv2.energyAccountMarketDocumentMrid,
      bspOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'Organization does not have permission to get MV.'
    );
  });

  it('I should be able to query comptage MV for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new MVMockTransaction(mockStub).createMV(mv, dsoOrganization);
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );
    await new MVMockTransaction(mockStub).createMV(mv2, otherDSOOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const queryResponse: QueryResponse<MV[]> = await new MVMockTransaction(
      mockStub
    ).queryMV(
      JSON.stringify({
        objectAggregationMeteringPoint: 'sitePRMtest'
      }),
      bspOrganization
    );
    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(1);
    expect(queryResponse.payload[0].energyAccountMarketDocumentMrid).equal(
      mv.energyAccountMarketDocumentMrid
    );
  });
});
