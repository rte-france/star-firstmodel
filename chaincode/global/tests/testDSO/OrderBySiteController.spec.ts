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
  otherDSOOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {StatusCode} from '../enums/StatusCode';
import {OrderBySiteActivationDocumentMockTransaction} from '../mockControllers/OrderBySiteActivationDocumentMockTransaction';
import {OrderBySiteActivationDocumentHelper} from '../helper/OrderBySiteActivationDocument.helper';
import {OrderBySiteActivationDocument} from '../../src/orderBySiteActivationDocument/OrderBySiteActivationDocument';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {InvokeResponse} from '../common/InvokeResponse';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {QueryResponse} from '../common/QueryResponse';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const mvSite: Site = new SiteHelper().createSite(
  'siteIdMV',
  SiteType.MV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const mv2Site: Site = new SiteHelper().createSite(
  'siteIdMV2',
  SiteType.MV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const mv3Site: Site = new SiteHelper().createSite(
  'siteIdMV3',
  SiteType.MV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const hvSite: Site = new SiteHelper().createSite(
  'siteIdHV',
  SiteType.HV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const orderBySiteActivationDocumentHV: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument(
  'idOrderBySiteActivationDocument0',
  'siteIdHV'
);
const orderBySiteActivationDocumentMV: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument(
  'idOrderBySiteActivationDocument1',
  'siteIdMV'
);
const orderBySiteActivationDocumentMV2: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument(
  'idOrderBySiteActivationDocument2',
  'siteIdMV2'
);
const orderBySiteActivationDocumentMV3: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument(
  'idOrderBySiteActivationDocument3',
  'siteIdMV3'
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(dsoOrganizationType.mspId);
  }
);

describe('As DSO ', () => {
  it('I should be able to create an OrderBySiteActivationDocument with site type MV.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    const invokeResponse: ChaincodeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV],
      dsoOrganization
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(
      JSON.stringify([orderBySiteActivationDocumentMV])
    );
  });

  it('I should not be able to create an OrderBySiteActivationDocument with site type MV when my organization does not have the permission.', async () => {
    mv2Site.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mv2Site,
      otherDSOOrganization
    );

    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV2],
      dsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'Organization does not have the permission to create orderBySiteActivationDocument.'
    );
  });

  it('I should be able to update an OrderBySiteActivationDocument with site type MV.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV],
      dsoOrganization
    );

    const updateOrderBySiteActivationDocument: OrderBySiteActivationDocument = orderBySiteActivationDocumentMV;
    updateOrderBySiteActivationDocument.orderValue = 1;

    const invokeResponse: InvokeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).updateOrderBySiteActivationDocument(
      updateOrderBySiteActivationDocument,
      dsoOrganization
    );
    const updatedOrderBySite: OrderBySiteActivationDocument = JSON.parse(
      invokeResponse.payload.toString()
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedOrderBySite.idOrderBySite).equal(
      updateOrderBySiteActivationDocument.idOrderBySite
    );
    expect(updatedOrderBySite.orderValue).equal(1);
  });

  it('I should not be able to update an OrderBySiteActivationDocument with site type MV for which my organization does not have the permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(
      mv2Site,
      otherDSOOrganization
    );
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV2],
      otherDSOOrganization
    );

    const updateOrderBySiteActivationDocument: OrderBySiteActivationDocument = orderBySiteActivationDocumentMV2;
    updateOrderBySiteActivationDocument.orderValue = 1;
    const isErrorExpected = true;
    const invokeResponse: InvokeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).updateOrderBySiteActivationDocument(
      updateOrderBySiteActivationDocument,
      dsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `Organization does not have the permission to update ${updateOrderBySiteActivationDocument.idOrderBySite}.`
    );
  });

  it('I should not be able to create an OrderBySiteActivationDocument with site type HV.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(hvSite, dsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentHV],
      dsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `OrganizationType is not allowed to create orderBySiteActivationDocuments for the type of ${hvSite.siteId} in orderBySiteActivationDocuments.`
    );
  });

  it('I should not be able to update an OrderBySiteActivationDocument with site type HV.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentHV],
      tsoOrganization
    );

    mockStub.setCreator(dsoOrganizationType.mspId);
    const updateOrderBySiteActivationDocument: OrderBySiteActivationDocument = orderBySiteActivationDocumentHV;
    updateOrderBySiteActivationDocument.orderValue = 1;
    const isErrorExpected = true;
    const invokeResponse: InvokeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).updateOrderBySiteActivationDocument(
      updateOrderBySiteActivationDocument,
      dsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `OrganizationType is not allowed to update orderBySiteActivationDocument for the type of ${hvSite.siteId}.`
    );
  });

  it('I should be able to get an OrderBySiteActivationDocument by Id with site type MV for which my organization has permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV],
      dsoOrganization
    );

    const queryResponse: QueryResponse<OrderBySiteActivationDocument> = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).getOrderBySiteActivationDocumentById(
      orderBySiteActivationDocumentMV.idOrderBySite,
      dsoOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.idOrderBySite).equal(
      orderBySiteActivationDocumentMV.idOrderBySite
    );
  });

  it('I should not be able to get an OrderBySiteActivationDocument by Id with site type MV for which my organization does not have permission.', async () => {
    mv3Site.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mv3Site,
      otherDSOOrganization
    );

    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV3],
      otherDSOOrganization
    );

    const isErrorExpected = true;
    const queryResponse: QueryResponse<OrderBySiteActivationDocument> = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).getOrderBySiteActivationDocumentById(
      orderBySiteActivationDocumentMV3.idOrderBySite,
      dsoOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(JSON.stringify(queryResponse.message)).to.contain(
      `Organization is not allowed to get ${orderBySiteActivationDocumentMV3.idOrderBySite}`
    );
  });

  it('I should be able to get all OrderBySiteActivationDocuments with site type MV for which my organization has permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mv2Site.a04RegisteredResourceMrid = dsoOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mv2Site,
      dsoOrganization
    );

    mv3Site.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mv3Site,
      otherDSOOrganization
    );

    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV],
      dsoOrganization
    );

    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV2],
      dsoOrganization
    );

    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV3],
      otherDSOOrganization
    );

    const queryResponse: QueryResponse<OrderBySiteActivationDocument[]> = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).getAllOrderBySiteActivationDocuments(dsoOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(2);
  });

  it('I should be able to query all OrderBySiteActivationDocuments with site type MV for which my organization has permission.', async () => {
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mv2Site.a04RegisteredResourceMrid = dsoOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mv2Site,
      dsoOrganization
    );

    mv3Site.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mv3Site,
      otherDSOOrganization
    );

    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV],
      dsoOrganization
    );

    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV2],
      dsoOrganization
    );

    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocumentMV3],
      otherDSOOrganization
    );

    const queryResponse: QueryResponse<OrderBySiteActivationDocument[]> = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).queryOrderBySiteActivationDocuments(
      JSON.stringify({
        nazaRegisteredResourceMrid: 'nazaRegisteredResourceMrid'
      }),
      dsoOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(2);
  });
});
