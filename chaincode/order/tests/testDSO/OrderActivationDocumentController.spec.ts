/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {OrderActivationDocumentHelper} from '../helper/OrderActivationDocument.helper';
import {OrderMockTransaction} from '../mockControllers/OrderMockTransaction';
import {
  dsoOrganization,
  dsoOrganizationType,
  otherDSOOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {initAndGetMockStub} from '../common/InitChaincode';
import {StatusCode} from '../enums/StatusCode';
import {QueryResponse} from '../common/QueryResponse';
import {OrderActivationDocument} from '../../src/orderActivationDocument/OrderActivationDocument';

let mockStub: ChaincodeMockStub;
const orderActivationDocument = new OrderActivationDocumentHelper().createOrder(
  'order_1',
  [dsoOrganization.organizationId, otherDSOOrganization.organizationId]
);
const orderActivationDocument2 = new OrderActivationDocumentHelper().createOrder(
  'order_2',
  [otherDSOOrganization.organizationId]
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(dsoOrganizationType.mspId);
  }
);

describe('As DSO ', () => {
  it('I should not be able to create a new OrderActivationDocument.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new OrderMockTransaction(
      mockStub
    ).createOrderActivationDocument(
      orderActivationDocument,
      dsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create an OrderActivationDocument.'
    );
  });

  it('I not should be able to update an OrderActivationDocument.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument,
      tsoOrganization
    );

    mockStub.setCreator(dsoOrganizationType.mspId);
    orderActivationDocument.orderAllValue = 1;
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new OrderMockTransaction(
      mockStub
    ).updateOrderActivationDocument(
      orderActivationDocument,
      tsoOrganization,
      isErrorExpected
    );

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to update an OrderActivationDocument.'
    );
  });

  it('I should be able to get all OrderActivationDocuments for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument,
      tsoOrganization
    );
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument2,
      tsoOrganization
    );

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<OrderActivationDocument[]> = await new OrderMockTransaction(
      mockStub
    ).getAllOrderActivationDocuments(dsoOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(1);
    expect(queryResponse.payload[0].orderId).equal(
      orderActivationDocument.orderId
    );
  });

  it('I should be able to get OrderActivationDocument by Id for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument,
      tsoOrganization
    );

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<OrderActivationDocument> = await new OrderMockTransaction(
      mockStub
    ).getOrderActivationDocumentById(
      orderActivationDocument.orderId,
      dsoOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.orderId).equal(
      orderActivationDocument.orderId
    );
  });

  it('I should not be able to get OrderActivationDocument by Id for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument2,
      tsoOrganization
    );

    mockStub.setCreator(dsoOrganizationType.mspId);
    const isErrorExpected = true;
    const queryResponse: QueryResponse<OrderActivationDocument> = await new OrderMockTransaction(
      mockStub
    ).getOrderActivationDocumentById(
      orderActivationDocument2.orderId,
      dsoOrganization,
      isErrorExpected
    );

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'Organization does not have permission to get this OrderActivationDocument.'
    );
  });

  it('I should be able to query OrderActivationDocuments for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument,
      tsoOrganization
    );
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument2,
      tsoOrganization
    );

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<OrderActivationDocument[]> = await new OrderMockTransaction(
      mockStub
    ).queryOrderActivationDocument(
      JSON.stringify({
        idAutomate: 'automate1'
      }),
      dsoOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(1);
    expect(queryResponse.payload[0].orderId).equal(
      orderActivationDocument.orderId
    );
  });
});
