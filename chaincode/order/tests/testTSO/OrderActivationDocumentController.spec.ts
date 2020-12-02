/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {OrderActivationDocumentHelper} from '../helper/OrderActivationDocument.helper';
import {
  dsoOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {OrderMockTransaction} from '../mockControllers/OrderMockTransaction';
import {initAndGetMockStub} from '../common/InitChaincode';
import {StatusCode} from '../enums/StatusCode';
import {OrderActivationDocument} from '../../src/orderActivationDocument/OrderActivationDocument';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const orderActivationDocument = new OrderActivationDocumentHelper().createOrder(
  'order_1',
  [dsoOrganization.organizationId]
);

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should be able to create a new OrderActivationDocument.', async () => {
    const invokeResponse: ChaincodeResponse = await new OrderMockTransaction(
      mockStub
    ).createOrderActivationDocument(orderActivationDocument, tsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(
      JSON.stringify(orderActivationDocument)
    );
  });

  it('I should be able to update an OrderActivationDocument.', async () => {
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument,
      tsoOrganization
    );

    const updatedOrderAllValue = 1;
    orderActivationDocument.orderAllValue = updatedOrderAllValue;
    const invokeResponse: ChaincodeResponse = await new OrderMockTransaction(
      mockStub
    ).updateOrderActivationDocument(orderActivationDocument, tsoOrganization);
    const updatedOrder: OrderActivationDocument = JSON.parse(
      invokeResponse.payload.toString()
    );

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedOrder.orderAllValue).equal(updatedOrderAllValue);
  });

  it('I should be able to get an OrderActivationDocument by Id.', async () => {
    await new OrderMockTransaction(mockStub).createOrderActivationDocument(
      orderActivationDocument,
      tsoOrganization
    );

    const queryResponse: QueryResponse<OrderActivationDocument> = await new OrderMockTransaction(
      mockStub
    ).getOrderActivationDocumentById(
      orderActivationDocument.orderId,
      tsoOrganization
    );
    expect(JSON.stringify(queryResponse.payload)).equal(
      JSON.stringify(orderActivationDocument)
    );
  });

  it('I should get back an empty response when id does not exist.', async () => {
    const isErrorExpected = true;
    const queryResponse: QueryResponse<OrderActivationDocument> = await new OrderMockTransaction(
      mockStub
    ).getOrderActivationDocumentById(
      orderActivationDocument.orderId,
      tsoOrganization,
      isErrorExpected
    );

    expect(queryResponse.message.toString()).equal(
      `Error: ${orderActivationDocument.orderId} does not exist.`
    );
  });
});
