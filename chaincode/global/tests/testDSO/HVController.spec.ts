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
  otherDSOOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {StatusCode} from '../enums/StatusCode';
import {HVMockTransaction} from '../mockControllers/HVMockTransaction';
import {HVHelper} from '../helper/HVHelper';
import {HV} from '../../src/HV/HV';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {QueryResponse} from '../common/QueryResponse';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';

let mockStub: ChaincodeMockStub;
const hv: HV = new HVHelper().createHV('id', 'siteId');
const hv2: HV = new HVHelper().createHV('id2', 'siteId2');
const hvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.HV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const hvSite2: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.HV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(dsoOrganizationType.mspId);
  }
);

describe('As DSO ', () => {
  it('I should not be able to create a new HV.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new HVMockTransaction(
      mockStub
    ).createHV(hv, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create HV.'
    );
  });

  it('I should not be able to update a comptage HV.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new HVMockTransaction(mockStub).createHV(hv, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new HVMockTransaction(
      mockStub
    ).updateHV(hv, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to update HV.'
    );
  });

  it('I should be able to get comptage HV by Id when I have the permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new HVMockTransaction(mockStub).createHV(hv, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<HV> = await new HVMockTransaction(
      mockStub
    ).getHVyId(hv.energyAccountMarketDocumentMrid, dsoOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.energyAccountMarketDocumentMrid).equal(
      hv.energyAccountMarketDocumentMrid
    );
  });

  it('I should not be able to get comptage HV by Id when I do not have the permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    hvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      hvSite2,
      tsoOrganization
    );
    await new HVMockTransaction(mockStub).createHV(hv2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const isErrorExpected = true;
    const queryResponse: QueryResponse<HV> = await new HVMockTransaction(
      mockStub
    ).getHVyId(
      hv2.energyAccountMarketDocumentMrid,
      dsoOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'Organization does not have permission to get HV.'
    );
  });

  it('I should be able to query comptage HV by Id when I have the permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new HVMockTransaction(mockStub).createHV(hv, tsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    hvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      hvSite2,
      tsoOrganization
    );
    await new HVMockTransaction(mockStub).createHV(hv2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<HV[]> = await new HVMockTransaction(
      mockStub
    ).queryHV(
      JSON.stringify({
        ppeSiteCode: 'sitePRMtest'
      }),
      dsoOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(1);
    expect(queryResponse.payload[0].energyAccountMarketDocumentMrid).equal(
      hv.energyAccountMarketDocumentMrid
    );
  });
});
