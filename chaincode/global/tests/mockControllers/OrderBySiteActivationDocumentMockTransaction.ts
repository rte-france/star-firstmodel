/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {IOrganization} from '../../interfaces/IOrganization';
import {OrderBySiteActivationDocument} from '../../src/orderBySiteActivationDocument/OrderBySiteActivationDocument';
import {QueryResponse} from '../common/QueryResponse';

export class OrderBySiteActivationDocumentMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createOrderBySiteActivationDocument(
    orderBySiteActivationDocument: OrderBySiteActivationDocument[],
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      [
        'OrderBySite.createOrderBySiteActivationDocument',
        JSON.stringify([orderBySiteActivationDocument]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async updateOrderBySiteActivationDocument(
    orderBySiteActivationDocument: OrderBySiteActivationDocument,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      [
        'OrderBySite.updateOrderBySiteActivationDocument',
        JSON.stringify([orderBySiteActivationDocument]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async getOrderBySiteActivationDocumentById(
    id: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<OrderBySiteActivationDocument>> {
    return mockQuery<OrderBySiteActivationDocument>(
      this.mockStub,
      [
        'OrderBySite.getOrderBySiteActivationDocumentById',
        JSON.stringify([id]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async getAllOrderBySiteActivationDocuments(
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<OrderBySiteActivationDocument[]>> {
    return mockQuery<OrderBySiteActivationDocument[]>(
      this.mockStub,
      [
        'OrderBySite.getAllOrderBySiteActivationDocuments',
        JSON.stringify([]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async queryOrderBySiteActivationDocuments(
    query: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<OrderBySiteActivationDocument[]>> {
    return mockQuery<OrderBySiteActivationDocument[]>(
      this.mockStub,
      [
        'OrderBySite.queryOrderBySiteActivationDocument',
        JSON.stringify([query]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }
}
