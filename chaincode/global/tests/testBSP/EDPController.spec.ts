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
  otherBSPOrganization,
  tsoOrganization
} from '../helper/Organization.helper';
import {EDP} from '../../src/edp/EDP';
import {EDPHelper} from '../helper/EDP.helper';
import {EDPMockTransaction} from '../mockControllers/EDPMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const eda2: EDA = new EDAHelper().createEda(
  'ID_EDA2',
  otherBSPOrganization.organizationId
);
const site: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.HV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const site2: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.HV,
  'ID_EDA2',
  dsoOrganization.organizationId
);
const edp: EDP = new EDPHelper().createEdp('edpRegisteredResourceId', 'siteId');
const edp2: EDP = new EDPHelper().createEdp(
  'edpRegisteredResourceId2',
  'siteId2'
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(bspOrganizationType.mspId);
  }
);

describe('As BSP ', () => {
  it('I should not be able to create a new EDP.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new EDPMockTransaction(
      mockStub
    ).createEDP(edp, bspOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create an EDP.'
    );
  });

  it('I should be able to update an EDP for which I have permission.', async () => {
    mockStub.setCreator(OrganizationTypeMsp.TSO);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(OrganizationTypeMsp.BSP);
    edp.edpRegisteredResourceName = 'test';
    const invokeResponse = await new EDPMockTransaction(mockStub).updateEDP(
      edp,
      bspOrganization
    );
    const updatedEDP: EDP = JSON.parse(invokeResponse.payload.toString());

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedEDP.edpRegisteredResourceId).equal(
      edp.edpRegisteredResourceId
    );
    expect(updatedEDP.edpRegisteredResourceName).equal('test');
  });

  it('I should not be able to update an EDP for which I do not have permission.', async () => {
    mockStub.setCreator(OrganizationTypeMsp.TSO);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site2, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(OrganizationTypeMsp.BSP);
    const isErrorExpected = true;
    const invokeResponse = await new EDPMockTransaction(mockStub).updateEDP(
      edp2,
      bspOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have permission to update EDP.'
    );
  });

  it('I should be able to get an EDP by id for which I have permission.', async () => {
    mockStub.setCreator(OrganizationTypeMsp.TSO);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    mockStub.setCreator(OrganizationTypeMsp.BSP);
    const invokeResponse = await new EDPMockTransaction(mockStub).getEDP(
      edp.edpRegisteredResourceId,
      bspOrganization
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(invokeResponse.payload)).equal(JSON.stringify(edp));
  });

  it('I should not be able to get an EDP by id for which I do not have permission.', async () => {
    mockStub.setCreator(OrganizationTypeMsp.TSO);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site2, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(OrganizationTypeMsp.BSP);
    const isErrorExpected = true;
    const invokeResponse = await new EDPMockTransaction(mockStub).getEDP(
      edp2.edpRegisteredResourceId,
      bspOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have permission to get this EDP.'
    );
  });

  it('I should be able to query EDPs for which I have permission.', async () => {
    mockStub.setCreator(OrganizationTypeMsp.TSO);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp, tsoOrganization);

    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(site2, tsoOrganization);
    await new EDPMockTransaction(mockStub).createEDP(edp2, tsoOrganization);

    mockStub.setCreator(OrganizationTypeMsp.BSP);
    const invokeResponse = await new EDPMockTransaction(mockStub).queryEDP(
      JSON.stringify({
        edpRegisteredResourceMrid: '17Y778300000I'
      }),
      bspOrganization
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.length).equal(1);
    expect(invokeResponse.payload[0].edpRegisteredResourceId).equal(
      edp.edpRegisteredResourceId
    );
  });
});
