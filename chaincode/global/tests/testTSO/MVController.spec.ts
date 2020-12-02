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

let mockStub: ChaincodeMockStub;
const mv: MV = new MVHelper().createMV('id', 'siteId');
const mvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.MV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should not be able to create a new MV.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).createMV(mv, tsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create MV.'
    );
  });

  it('I should not be able to update a comptage MV.', async () => {
    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new MVMockTransaction(mockStub).createMV(mv, dsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);

    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new MVMockTransaction(
      mockStub
    ).updateMV(mv, tsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to update MV.'
    );
  });
});
