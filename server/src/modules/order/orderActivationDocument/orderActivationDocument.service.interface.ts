/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {OrderActivationDocumentDto} from './dto/OrderActivationDocumentDto';

export interface IOrderActivationDocumentService {
  createOrderActivationDocument(
    orderActivationDocument: OrderActivationDocumentDto
  ): Promise<any>;

  updateOrderActivationDocument(
    orderActivationDocument: OrderActivationDocumentDto,
    id: string
  ): Promise<OrderActivationDocumentDto>;

  getOrderActivationDocumentById(
    id: string
  ): Promise<OrderActivationDocumentDto>;

  queryOrderActivationDocument(
    query: any
  ): Promise<OrderActivationDocumentDto[]>;

  getAllOrderActivationDocuments(): Promise<OrderActivationDocumentDto[]>;
}
