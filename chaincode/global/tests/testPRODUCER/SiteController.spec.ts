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
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {
  bspOrganization,
  dsoOrganization,
  otherBSPOrganization,
  otherProducerOrganization,
  producerOrganization,
  producerOrganizationType,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {StatusCode} from '../enums/StatusCode';
import {SiteType} from '../../src/site/enums/SiteType';
import {QueryResponse} from '../common/QueryResponse';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {query} from 'winston';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const secondEDA: EDA = new EDAHelper().createEda(
  'ID_EDA2',
  otherBSPOrganization.organizationId
);
const site: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.HV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const secondSite: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.HV,
  'ID_EDA2',
  dsoOrganization.organizationId,
  otherProducerOrganization.organizationId
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(producerOrganizationType.mspId);
  }
);

describe('As PRODUCER ', () => {
  it('I should not be able to create a new site.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new SiteMockTransaction(
      mockStub
    ).createSite(site, producerOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create a site.'
    );
  });

  it('I should not be able to update a site.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new SiteMockTransaction(
      mockStub
    ).updateSite(site, producerOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to update Site.'
    );
  });

  it('I should be able to get a site by Id for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, dsoOrganization);

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<Site> = await new SiteMockTransaction(
      mockStub
    ).getSiteById(site.siteId, producerOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(site));
  });

  it('I should not be able to get a site by Id for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEDA,
      tsoOrganization
    );
    await new SiteMockTransaction(mockStub).createSite(
      secondSite,
      dsoOrganization
    );

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<Site> = await new SiteMockTransaction(
      mockStub
    ).getSiteById(secondSite.siteId, producerOrganization, isErrorExpected);

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      `Organization does not have the permission to get ${secondSite.siteId}.`
    );
  });

  it('I should be able to query sites for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEDA,
      tsoOrganization
    );
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      secondSite,
      tsoOrganization
    );

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<Site[]> = await new SiteMockTransaction(
      mockStub
    ).querySite(
      JSON.stringify({
        nazaRegisteredResourceMrid: 'nazaRegisteredResourceMrid'
      }),
      producerOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify([site]));
    expect(queryResponse.payload.length).equal(1);
  });

  it('I should be able to get all sites for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEDA,
      tsoOrganization
    );
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      secondSite,
      tsoOrganization
    );

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<Site[]> = await new SiteMockTransaction(
      mockStub
    ).getAllSites(producerOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify([site]));
    expect(queryResponse.payload.length).equal(1);
  });
});
