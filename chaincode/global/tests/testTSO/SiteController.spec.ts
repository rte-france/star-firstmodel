/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {Site} from '../../src/site/Site';
import {expect} from 'chai';
import {SiteHelper} from '../helper/Site.helper';
import {EDP} from '../../src/edp/EDP';
import {EDPHelper} from '../helper/EDP.helper';
import {initAndGetMockStub} from '../common/InitChaincode';
import {
  dsoOrganization,
  dsoOrganizationType,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {EDPMockTransaction} from '../mockControllers/EDPMockTransaction';
import {InvokeResponse} from '../common/InvokeResponse';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const hvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.HV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const mvSite: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.MV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const edp: EDP = new EDPHelper().createEdp('edpRegisteredResourceId', 'siteId');

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should be able to create a new site with an HV site type.', async () => {
    const invokeResponse: ChaincodeResponse = await new SiteMockTransaction(
      mockStub
    ).createSite(hvSite, tsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(hvSite));
  });

  it('I should not be able to create a new site with an MV site type.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new SiteMockTransaction(
      mockStub
    ).createSite(mvSite, tsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      ` OrganizationType is not allowed to create a site for ${mvSite.voltageType} type`
    );
  });

  it('I should be able to get a site by Id.', async () => {
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);

    const queryResponse: QueryResponse<Site> = await new SiteMockTransaction(
      mockStub
    ).getSiteById(hvSite.siteId, tsoOrganization);

    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(hvSite));
  });

  it('I should be able to query site.', async () => {
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);

    const queryResponse: QueryResponse<Site[]> = await new SiteMockTransaction(
      mockStub
    ).querySite(
      JSON.stringify({
        nazaRegisteredResourceMrid: 'nazaRegisteredResourceMrid'
      }),
      tsoOrganization
    );

    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify([hvSite])
    );
  });

  it('I should get back an empty response when id does not exist.', async () => {
    const isErrorExpected = true;
    const queryResponse: QueryResponse<Site> = await new SiteMockTransaction(
      mockStub
    ).getSiteById(hvSite.siteId, tsoOrganization, isErrorExpected);

    expect(queryResponse.message.toString()).to.contain(
      `Error: ${hvSite.siteId} does not exist.`
    );
  });

  it('I should be able to get EDP by siteId.', async () => {
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);
    const queryResponse: QueryResponse<EDP[]> = await new SiteMockTransaction(
      mockStub
    ).queryEDPBysiteId(
      JSON.stringify({
        siteId: hvSite.siteId
      }),
      tsoOrganization
    );

    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify([edp]));
  });

  it('I should be able to update a site with an HV site type.', async () => {
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);

    hvSite.nazaRegisteredResourceMrid = [
      ...hvSite.nazaRegisteredResourceMrid,
      'newAutomate'
    ];
    const invokeResponse: InvokeResponse = await new SiteMockTransaction(
      mockStub
    ).updateSite(hvSite, tsoOrganization);
    const updatedHVSite: Site = JSON.parse(invokeResponse.payload.toString());

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedHVSite.siteId).equal(hvSite.siteId);
    expect(updatedHVSite.nazaRegisteredResourceMrid[1]).equal('newAutomate');
  });

  it('I should not be able to update a site with an MV site type.', async () => {
    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    mvSite.nazaRegisteredResourceMrid = [
      ...mvSite.nazaRegisteredResourceMrid,
      'newAutomate'
    ];
    const isErrorExpected = true;
    const invokeResponse: InvokeResponse = await new SiteMockTransaction(
      mockStub
    ).updateSite(mvSite, tsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to update a site for MV type.'
    );
  });
});
