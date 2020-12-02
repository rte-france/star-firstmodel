/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {OrderBySiteActivationDocument} from '../../src/models/OrderBySiteActivationDocument';
import * as uuidv4 from 'uuid/v4';

export class OrderBySiteActivationDocumentHelper {
  public createOrderBySiteActivationDocument(): OrderBySiteActivationDocument {
    return new OrderBySiteActivationDocument(
      'orderBySiteActivationDocumentId',
      'orderId_0909',
      'siteId',
      [
        {
          idLogOrdre: 'log-order_' + uuidv4(),
          message: '',
          type: 'reception',
          success: true,
          logOrderTimestamp: '1570981678'
        },
        {
          idLogOrdre: 'log-order_' + uuidv4(),
          message: '',
          type: 'activation',
          success: true,
          logOrderTimestamp: '1570981678'
        }
      ],
      9000,
      'timeStamp',
      'CET',
      'MW',
      '1',
      'A53',
      'TSO1',
      'TOR',
      'A41'
    );
  }
}
