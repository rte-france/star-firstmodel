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
import {OrderBySiteActivationDocumentMockTransaction} from '../mockControllers/OrderBySiteActivationDocumentMockTransaction';
import {OrderBySiteActivationDocumentHelper} from '../helper/OrderBySiteActivationDocument.helper';
import {OrderBySiteActivationDocument} from '../../src/orderBySiteActivationDocument/OrderBySiteActivationDocument';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {InvokeResponse} from '../common/InvokeResponse';

let mockStub: ChaincodeMockStub;
const mvSite: Site = new SiteHelper().createSite(
  'siteIdMV',
  SiteType.MV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const hvSite: Site = new SiteHelper().createSite(
  'siteIdHV',
  SiteType.HV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const orderBySiteActivationDocumentHV: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument(
  'idOrderBySiteActivationDocument',
  'siteIdHV'
);
const orderBySiteActivationDocumentMV: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument(
  'idOrderBySiteActivationDocument',
  'siteIdMV'
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should be able to create an OrderBySiteActivationDocument with site type HV.', async () => {
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    const invokeResponse: ChaincodeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentHV],
      tsoOrganization
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(
      JSON.stringify([orderBySiteActivationDocumentHV])
    );
  });

  it('I should be able to update an OrderBySiteActivationDocument with site type HV.', async () => {
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentHV],
      tsoOrganization
    );

    const updateOrderBySite: OrderBySiteActivationDocument = orderBySiteActivationDocumentHV;
    updateOrderBySite.orderValue = 1;

    const invokeResponse: InvokeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).updateOrderBySiteActivationDocument(updateOrderBySite, tsoOrganization);
    const updatedOrderBySite: OrderBySiteActivationDocument = JSON.parse(
      invokeResponse.payload.toString()
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedOrderBySite.idOrderBySite).equal(
      updateOrderBySite.idOrderBySite
    );
    expect(updatedOrderBySite.orderValue).equal(1);
  });

  it('I should be able to create an OrderBySiteActivationDocument with site type MV.', async () => {
    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    const invokeResponse: ChaincodeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV],
      tsoOrganization
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(
      JSON.stringify([orderBySiteActivationDocumentMV])
    );
  });

  it('I should not be able to update an OrderBySiteActivationDocument with site type MV.', async () => {
    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV],
      dsoOrganization
    );

    mockStub.setCreator(tsoOrganizationType.mspId);
    const updateOrderBySite: OrderBySiteActivationDocument = orderBySiteActivationDocumentMV;
    updateOrderBySite.orderValue = 1;
    const isErrorExpected = true;
    const invokeResponse: InvokeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).updateOrderBySiteActivationDocument(
      updateOrderBySite,
      tsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `OrganizationType is not allowed to update orderBySiteActivationDocument for the type of ${mvSite.siteId}.`
    );
  });
});
