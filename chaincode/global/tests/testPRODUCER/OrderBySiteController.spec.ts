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
  otherBSPOrganization,
  otherDSOOrganization,
  otherProducerOrganization,
  producerOrganization,
  producerOrganizationType,
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
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const eda2: EDA = new EDAHelper().createEda(
  'ID_EDA2',
  otherBSPOrganization.organizationId
);
const hvSite: Site = new SiteHelper().createSite(
  'siteIdHV',
  SiteType.HV,
  'ID_EDA',
  dsoOrganization.organizationId
);
const hvSite2: Site = new SiteHelper().createSite(
  'siteIdHV2',
  SiteType.HV,
  'ID_EDA2',
  otherDSOOrganization.organizationId,
  otherProducerOrganization.organizationId
);
const orderBySiteActivationDocument: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument(
  'idOrderBySiteActivationDocument',
  'siteIdHV'
);
const orderBySiteActivationDocument2: OrderBySiteActivationDocument = new OrderBySiteActivationDocumentHelper().createOrderBySiteActivationDocument(
  'idOrderBySiteActivationDocument2',
  'siteIdHV2'
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(producerOrganizationType.mspId);
  }
);

describe('As PRODUCER ', () => {
  it('I should not be able to create an OrderBySiteActivationDocument.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);

    mockStub.setCreator(producerOrganizationType.mspId);
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocument],
      producerOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create orderBySiteActivationDocuments.'
    );
  });

  it('I should be able to update an OrderBySiteActivationDocument for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocument],
      tsoOrganization
    );

    mockStub.setCreator(producerOrganizationType.mspId);
    orderBySiteActivationDocument.orderValue = 100;
    const invokeResponse: ChaincodeResponse = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).updateOrderBySiteActivationDocument(
      orderBySiteActivationDocument,
      producerOrganization
    );
    const updatedOrderBySite: OrderBySiteActivationDocument = JSON.parse(
      invokeResponse.payload.toString()
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedOrderBySite.orderValue).equal(100);
  });

  it('I should be able to get an OrderBySiteActivationDocument for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocument],
      tsoOrganization
    );

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<OrderBySiteActivationDocument> = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).getOrderBySiteActivationDocumentById(
      orderBySiteActivationDocument.idOrderBySite,
      producerOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify(orderBySiteActivationDocument)
    );
  });

  it('I should not be able to get an OrderBySiteActivationDocument for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      hvSite2,
      tsoOrganization
    );
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocument2],
      tsoOrganization
    );

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<OrderBySiteActivationDocument> = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).getOrderBySiteActivationDocumentById(
      orderBySiteActivationDocument2.idOrderBySite,
      producerOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      `Organization is not allowed to get ${orderBySiteActivationDocument2.idOrderBySite}`
    );
  });

  it('I should be able to query OrderBySiteActivationDocuments for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocument],
      tsoOrganization
    );

    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      hvSite2,
      tsoOrganization
    );
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocument2],
      tsoOrganization
    );

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<OrderBySiteActivationDocument[]> = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).queryOrderBySiteActivationDocuments(
      JSON.stringify({
        nazaRegisteredResourceMrid: 'nazaRegisteredResourceMrid'
      }),
      producerOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify([orderBySiteActivationDocument])
    );
    expect(queryResponse.payload.length).equal(1);
  });

  it('I should be able to get all OrderBySiteActivationDocuments for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(hvSite, tsoOrganization);
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocument],
      tsoOrganization
    );

    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new SiteMockTransaction(mockStub).createSite(
      hvSite2,
      tsoOrganization
    );
    await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).createOrderBySiteActivationDocument(
      [orderBySiteActivationDocument2],
      tsoOrganization
    );

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<OrderBySiteActivationDocument[]> = await new OrderBySiteActivationDocumentMockTransaction(
      mockStub
    ).getAllOrderBySiteActivationDocuments(producerOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify([orderBySiteActivationDocument])
    );
    expect(queryResponse.payload.length).equal(1);
  });
});
