/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {OrderBySiteActivationDocument} from '../../src/orderBySiteActivationDocument/OrderBySiteActivationDocument';

export class OrderBySiteActivationDocumentHelper {
  public createOrderBySiteActivationDocument(
    orderBySiteId: string,
    siteId: string
  ): OrderBySiteActivationDocument {
    return new OrderBySiteActivationDocument(
      orderBySiteId,
      'orderId_0909',
      siteId,
      [],
      9000,
      'createdDateTime',
      'CET',
      'MW',
      '1',
      'A53',
      'rte',
      'TOR',
      'A41'
    );
  }
}
