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
import {EDP} from '../../src/edp/EDP';
import {EDPHelper} from '../helper/EDP.helper';
import {EDPMockTransaction} from '../mockControllers/EDPMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const edp: EDP = new EDPHelper().createEdp('edpRegisteredResourceId', 'siteId');
const edp2: EDP = new EDPHelper().createEdp(
  'edpRegisteredResourceId2',
  'siteId2'
);
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
  it('I should not be able to create a new EDP.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new EDPMockTransaction(
      mockStub
    ).createEDP(edp, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create an EDP.'
    );
  });

  it('I should be able to update an EDP when I have the permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    edp.edpRegisteredResourceName = 'test';
    const invokeResponse: ChaincodeResponse = await new EDPMockTransaction(
      mockStub
    ).updateEDP(edp, dsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(edp));
  });

  it('I should be able to update an EDP when I have the permission.', async () => {
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    edp.edpRegisteredResourceName = 'test';
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new EDPMockTransaction(
      mockStub
    ).updateEDP(edp2, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have permission to update EDP'
    );
  });

  it('I should be able to get an EDP by Id when I have the permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<EDP> = await new EDPMockTransaction(
      mockStub
    ).getEDP(edp.edpRegisteredResourceId, dsoOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.edpRegisteredResourceId).equal(
      edp.edpRegisteredResourceId
    );
  });

  it('I should not be able to get an EDP by Id when I do not have the permission.', async () => {
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const isErrorExpected = true;
    const queryResponse: QueryResponse<EDP> = await new EDPMockTransaction(
      mockStub
    ).getEDP(edp2.edpRegisteredResourceId, dsoOrganization, isErrorExpected);

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'Organization does not have permission to get this EDP.'
    );
  });

  it('I should be able to query an EDP by Id when I have the permission.', async () => {
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<EDP[]> = await new EDPMockTransaction(
      mockStub
    ).queryEDP(
      JSON.stringify({
        edpRegisteredResourceMrid: '17Y778300000I'
      }),
      dsoOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(1);
    expect(queryResponse.payload[0].edpRegisteredResourceId).equal(
      edp.edpRegisteredResourceId
    );
  });
});
