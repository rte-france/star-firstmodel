/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {Site} from '../../src/site/Site';
import {expect} from 'chai';
import {SiteHelper} from '../helper/Site.helper';
import {initAndGetMockStub} from '../common/InitChaincode';
import {
  dsoOrganization,
  dsoOrganizationType,
  otherDSOOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {InvokeResponse} from '../common/InvokeResponse';
import {EDPMockTransaction} from '../mockControllers/EDPMockTransaction';
import {QueryResponse} from '../common/QueryResponse';
import {EDP} from '../../src/edp/EDP';
import {EDPHelper} from '../helper/EDP.helper';

let mockStub: ChaincodeMockStub;
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
const hvSite: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.HV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const edp: EDP = new EDPHelper().createEdp('edpRegisteredResourceId', 'siteId');

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(dsoOrganizationType.mspId);
  }
);

describe('As DSO ', () => {
  it('I should be able to create a new site with an MV site type.', async () => {
    const invokeResponse: ChaincodeResponse = await new SiteMockTransaction(
      mockStub
    ).createSite(mvSite, dsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(mvSite));
  });

  it('I should not be able to create a new site with an HV site type.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new SiteMockTransaction(
      mockStub
    ).createSite(hvSite, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `OrganizationType is not allowed to create a site for ${hvSite.voltageType} type.`
    );
  });

  it('I should not be able to create a new site with an MV site type when I do not have the permissions.', async () => {
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new SiteMockTransaction(
      mockStub
    ).createSite(mvSite2, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `Organization does not have the permission to create Site.`
    );
  });

  it('I should be able to update a site with an MV site type.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mvSite.nazaRegisteredResourceMrid = [
      ...mvSite.nazaRegisteredResourceMrid,
      'newAutomate'
    ];
    const invokeResponse: InvokeResponse = await new SiteMockTransaction(
      mockStub
    ).updateSite(mvSite, dsoOrganization);
    const updatedMvSite: Site = JSON.parse(invokeResponse.payload.toString());

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedMvSite.siteId).equal(mvSite.siteId);
    expect(updatedMvSite.nazaRegisteredResourceMrid[1]).equal('newAutomate');
  });

  it('I should not be able to update a site with an HV site type.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    hvSite.nazaRegisteredResourceMrid = [
      ...hvSite.nazaRegisteredResourceMrid,
      'newAutomate'
    ];
    const isErrorExpected = true;
    const invokeResponse: InvokeResponse = await new SiteMockTransaction(
      mockStub
    ).updateSite(hvSite, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to update a site for HV type.'
    );
  });

  it('I should not be able to update a site with an MV site type when I do not have the permissions.', async () => {
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    mvSite2.nazaRegisteredResourceMrid = [
      ...hvSite.nazaRegisteredResourceMrid,
      'newAutomate'
    ];
    const isErrorExpected = true;
    const invokeResponse: InvokeResponse = await new SiteMockTransaction(
      mockStub
    ).updateSite(mvSite2, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have the permission to update Site.'
    );
  });

  it('I should be able to get a site by Id for which I have permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    const queryResponse: QueryResponse<Site> = await new SiteMockTransaction(
      mockStub
    ).getSiteById(mvSite.siteId, dsoOrganization);

    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(mvSite));
  });

  it('I should not be able to get a site by Id for which I do not have permission.', async () => {
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    const isErrorExpected = true;
    const queryResponse: QueryResponse<Site> = await new SiteMockTransaction(
      mockStub
    ).getSiteById(mvSite2.siteId, dsoOrganization, isErrorExpected);

    expect(queryResponse.message.toString()).to.contain(
      `Organization does not have the permission to get ${mvSite2.siteId}`
    );
  });

  it('I should be able to query sites as DSO for which I have permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    const queryResponse: QueryResponse<Site[]> = await new SiteMockTransaction(
      mockStub
    ).querySite(
      JSON.stringify({
        nazaRegisteredResourceMrid: 'nazaRegisteredResourceMrid'
      }),
      dsoOrganization
    );

    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify([mvSite])
    );
    expect(queryResponse.payload.length).equal(1);
  });

  it('I should be able to get all sites as DSO for which I have permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    const queryResponse: QueryResponse<Site[]> = await new SiteMockTransaction(
      mockStub
    ).getAllSites(dsoOrganization);

    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify([mvSite])
    );
    expect(queryResponse.payload.length).equal(1);
  });

  it('I should be able to get EDP by siteId for which I have permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<EDP[]> = await new SiteMockTransaction(
      mockStub
    ).queryEDPBysiteId(
      JSON.stringify({
        siteId: mvSite.siteId
      }),
      dsoOrganization
    );

    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify([edp]));
  });
});
