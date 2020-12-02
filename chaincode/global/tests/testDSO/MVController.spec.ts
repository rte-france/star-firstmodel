/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {initAndGetMockStub} from '../common/InitChaincode';
import {
  dsoOrganization,
  dsoOrganizationType,
  otherDSOOrganization
} from '../helper/Organization.helper';
import {StatusCode} from '../enums/StatusCode';
import {MVMockTransaction} from '../mockControllers/MVMockTransaction';
import {MV} from '../../src/MV/MV';
import {MVHelper} from '../helper/MV.helper';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const mv: MV = new MVHelper().createMV('id1', 'siteId');
const mv2: MV = new MVHelper().createMV('id2', 'siteId2');
const mvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.MV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const mvSite2: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.MV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(dsoOrganizationType.mspId);
  }
);

describe('As DSO ', () => {
  it('I should be able to create a new MV when I have the permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).createMV(mv, dsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(mv));
  });

  it('I should not be able to create a new MV when I do not have the permission.', async () => {
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).createMV(mv2, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have permission to create MV.'
    );
  });

  it('I should be able to update a comptage MV when I have the permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new MVMockTransaction(mockStub).createMV(mv, dsoOrganization);

    const newResolution = 30500;
    mv.resolution = newResolution;
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).updateMV(mv, dsoOrganization);

    const updatedMV: MV = JSON.parse(invokeResponse.payload.toString());

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedMV.energyAccountMarketDocumentMrid).equals(
      mv.energyAccountMarketDocumentMrid
    );
    expect(updatedMV.resolution).equals(newResolution);
  });

  it('I should not be able to update a comptage MV when I do not have the permission.', async () => {
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );
    await new MVMockTransaction(mockStub).createMV(mv2, otherDSOOrganization);

    mv.resolution = 500;
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).updateMV(mv2, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have permission to update MV.'
    );
  });

  it('I should be able to get comptage MV by Id when I have the permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new MVMockTransaction(mockStub).createMV(mv, dsoOrganization);

    const queryResponse: QueryResponse<MV> = await new MVMockTransaction(
      mockStub
    ).getMVById(mv.energyAccountMarketDocumentMrid, dsoOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.energyAccountMarketDocumentMrid).equal(
      mv.energyAccountMarketDocumentMrid
    );
  });

  it('I should not be able to get comptage MV by Id when I do not have the permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );
    await new MVMockTransaction(mockStub).createMV(mv2, otherDSOOrganization);

    const isErrorExpected = true;
    const queryResponse: QueryResponse<MV> = await new MVMockTransaction(
      mockStub
    ).getMVById(
      mv2.energyAccountMarketDocumentMrid,
      dsoOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'Organization does not have permission to get MV.'
    );
  });

  it('I should be able to get comptage MVs by query when I have the permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );
    await new MVMockTransaction(mockStub).createMV(mv2, otherDSOOrganization);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new MVMockTransaction(mockStub).createMV(mv, dsoOrganization);

    const queryResponse: QueryResponse<MV[]> = await new MVMockTransaction(
      mockStub
    ).queryMV(
      JSON.stringify({
        objectAggregationMeteringPoint: 'sitePRMtest'
      }),
      dsoOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(1);
    expect(queryResponse.payload[0].energyAccountMarketDocumentMrid).equal(
      mv.energyAccountMarketDocumentMrid
    );
  });
});
