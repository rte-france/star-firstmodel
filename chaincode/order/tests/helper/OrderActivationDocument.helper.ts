/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {OrderActivationDocument} from '../../src/orderActivationDocument/OrderActivationDocument';

export class OrderActivationDocumentHelper {
  public createOrder(
    orderId: string,
    a04RegisteredResourceMrid: string[]
  ): OrderActivationDocument {
    return new OrderActivationDocument(
      orderId,
      'automate1',
      0,
      '1570981678',
      ['PRM00000000234766'],
      a04RegisteredResourceMrid,
      'MW',
      '1',
      'A53',
      'rte',
      'TOR',
      'A41'
    );
  }
}
