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
  dsoOrganization,
  dsoOrganizationType,
  otherBSPOrganization,
  otherDSOOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {EDAHelper} from '../helper/EDA.helper';
import {EDA} from '../../src/eda/EDA';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
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
const mvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.MV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const otherMvSite: Site = new SiteHelper().createSite(
  'othersiteId',
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
  it('I should not be able to create a new EDA.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new EDAMockTransaction(
      mockStub
    ).createEDA(eda, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create an EDA.'
    );
  });

  it('I should be able to get an EDA that is assigned to my organization when I get an EDA by ID.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getEDAById(eda.edaRegisteredResourceId, dsoOrganization);

    expect(queryResponse.status).equal(200);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(eda));
  });

  it('I should not be able to get an EDA that is assigned to another organization when I get an EDA by ID.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    otherMvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    otherMvSite.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      otherMvSite,
      otherDSOOrganization
    );

    const isErrorExpected = true;
    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getEDAById(eda.edaRegisteredResourceId, dsoOrganization, isErrorExpected);

    expect(queryResponse.status).equal(500);
    expect(queryResponse.message.toString()).to.contain(
      `DSO organization has no permission to get ${eda.edaRegisteredResourceId}.`
    );
  });

  it('I should be able to get EDAs that is assigned to my organization when I get all EDAs.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEda,
      tsoOrganization
    );

    mvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    otherMvSite.edaRegisteredResourceId = secondEda.edaRegisteredResourceId;
    otherMvSite.a04RegisteredResourceMrid = dsoOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      otherMvSite,
      dsoOrganization
    );

    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).getAllEDAs(dsoOrganization);
    const retrievedEDAs: EDA[] = JSON.parse(
      JSON.stringify(queryResponse.payload)
    );

    expect(queryResponse.status).equal(200);
    expect(retrievedEDAs.length).equal(2);
    expect(retrievedEDAs[0].edaRegisteredResourceId).equal(
      eda.edaRegisteredResourceId
    );
    expect(retrievedEDAs[1].edaRegisteredResourceId).equal(
      secondEda.edaRegisteredResourceId
    );
  });

  it('I should be able to get EDAs that is assigned to my organization when I query all EDAs.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(
      secondEda,
      tsoOrganization
    );

    mvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    otherMvSite.edaRegisteredResourceId = secondEda.edaRegisteredResourceId;
    otherMvSite.a04RegisteredResourceMrid = dsoOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      otherMvSite,
      dsoOrganization
    );

    const queryResponse: QueryResponse<EDA> = await new EDAMockTransaction(
      mockStub
    ).queryEDAs(
      JSON.stringify({
        edaRegisteredResourceMrid: 'code_EDA'
      }),
      dsoOrganization
    );
    const retrievedEDAs: EDA[] = JSON.parse(
      JSON.stringify(queryResponse.payload)
    );

    expect(queryResponse.status).equal(200);
    expect(retrievedEDAs.length).equal(2);
    expect(retrievedEDAs[0].edaRegisteredResourceId).equal(
      eda.edaRegisteredResourceId
    );
    expect(retrievedEDAs[1].edaRegisteredResourceId).equal(
      secondEda.edaRegisteredResourceId
    );
  });

  it('I should be able to update an EDA for which I have the permissions.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    eda.edaRegisteredResourceMrid = 'newCode';
    const invokeResponse: ChaincodeResponse = await new EDAMockTransaction(
      mockStub
    ).updateEDA(eda, dsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(eda));
  });
});
