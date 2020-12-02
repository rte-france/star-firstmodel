/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {IOrganization} from '../../interfaces/IOrganization';
import {OrderActivationDocument} from '../../src/orderActivationDocument/OrderActivationDocument';
import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {QueryResponse} from '../common/QueryResponse';

export class OrderMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createOrderActivationDocument(
    orderActivationDocument: OrderActivationDocument,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      [
        'Order.createOrderActivationDocument',
        JSON.stringify([orderActivationDocument]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async updateOrderActivationDocument(
    orderActivationDocument: OrderActivationDocument,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      [
        'Order.updateOrderActivationDocument',
        JSON.stringify([orderActivationDocument]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async getAllOrderActivationDocuments(
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<OrderActivationDocument[]>> {
    return mockQuery<OrderActivationDocument[]>(
      this.mockStub,
      [
        'Order.getAllOrderActivationDocuments',
        JSON.stringify([]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async getOrderActivationDocumentById(
    id: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<OrderActivationDocument>> {
    return mockQuery<OrderActivationDocument>(
      this.mockStub,
      [
        'Order.getOrderActivationDocumentById',
        JSON.stringify([id]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async queryOrderActivationDocument(
    query: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<OrderActivationDocument[]>> {
    return mockQuery<OrderActivationDocument[]>(
      this.mockStub,
      [
        'Order.queryOrderActivationDocument',
        JSON.stringify([query]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }
}
