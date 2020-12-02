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
  otherProducerOrganization,
  producerOrganization,
  producerOrganizationType,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {StatusCode} from '../enums/StatusCode';
import {HVMockTransaction} from '../mockControllers/HVMockTransaction';
import {HVHelper} from '../helper/HVHelper';
import {HV} from '../../src/HV/HV';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const hv: HV = new HVHelper().createHV('id', 'siteId');
const hv2: HV = new HVHelper().createHV('id2', 'siteId2');
const hvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.HV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const hvSite2: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.HV,
  'ID_EDA2',
  dsoOrganization.organizationId,
  otherProducerOrganization.organizationId
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
    mockStub = await initAndGetMockStub(producerOrganizationType.mspId);
  }
);

describe('As BSP ', () => {
  it('I should not be able to create a new HV', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new HVMockTransaction(
      mockStub
    ).createHV(hv, producerOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create HV.'
    );
  });

  it('I should be able to update a comptage HV for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new HVMockTransaction(mockStub).createHV(hv, tsoOrganization);

    mockStub.setCreator(producerOrganizationType.mspId);
    hv.resolution = 5;
    const invokeResponse: ChaincodeResponse = await new HVMockTransaction(
      mockStub
    ).updateHV(hv, producerOrganization);
    const updatedHV: HV = JSON.parse(invokeResponse.payload.toString());

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedHV.energyAccountMarketDocumentMrid).equal(
      hv.energyAccountMarketDocumentMrid
    );
    expect(updatedHV.resolution).equal(5);
  });

  it('I should not be able to update a comptage HV for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      hvSite2,
      tsoOrganization
    );
    await new HVMockTransaction(mockStub).createHV(hv2, tsoOrganization);

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    hv2.resolution = 5;
    const invokeResponse: ChaincodeResponse = await new HVMockTransaction(
      mockStub
    ).updateHV(hv, producerOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have permission to update HV.'
    );
  });

  it('I should be able to get a comptage HV for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new HVMockTransaction(mockStub).createHV(hv, tsoOrganization);

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<HV> = await new HVMockTransaction(
      mockStub
    ).getHVyId(hv.energyAccountMarketDocumentMrid, producerOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(hv));
  });

  it('I should not be able to get a comptage HV for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      hvSite2,
      tsoOrganization
    );
    await new HVMockTransaction(mockStub).createHV(hv2, tsoOrganization);

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<HV> = await new HVMockTransaction(
      mockStub
    ).getHVyId(
      hv2.energyAccountMarketDocumentMrid,
      producerOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'Organization does not have permission to get HV.'
    );
  });

  it('I should be able to query comptage HV.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new HVMockTransaction(mockStub).createHV(hv, tsoOrganization);

    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      hvSite2,
      tsoOrganization
    );
    await new HVMockTransaction(mockStub).createHV(hv2, tsoOrganization);

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<HV[]> = await new HVMockTransaction(
      mockStub
    ).queryHV(
      JSON.stringify({
        ppeSiteCode: 'sitePRMtest'
      }),
      producerOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(1);
  });
});
