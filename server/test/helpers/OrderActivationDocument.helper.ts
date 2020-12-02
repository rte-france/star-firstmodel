/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {OrderActivationDocument} from '../../src/models/OrderActivationDocument';

export class OrderActivationDocumentHelper {
  public createOrderActivationDocument(
    nazaRegisteredResourceMrid: string,
    objectAggregationMeteringPoint: string[],
    a04RegisteredResourceMrid: string[]
  ): OrderActivationDocument {
    return new OrderActivationDocument(
      'orderId',
      nazaRegisteredResourceMrid,
      0,
      '1572184800',
      ['PRM00000000234766'],
      a04RegisteredResourceMrid,
      'MW',
      '1',
      'A53',
      'TSO1',
      'TOR',
      'A41'
    );
  }
}
