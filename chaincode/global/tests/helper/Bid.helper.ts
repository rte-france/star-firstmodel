/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Bid} from '../../src/bid/Bid';

export class BidHelper {
  public createBid(bidId: string, edaRegisteredResourceId: string): Bid {
    return new Bid(
      bidId,
      edaRegisteredResourceId,
      '7Y778300000I',
      'TJHE783',
      'Tue Oct 06 00:00:00 CET 2019',
      'Tue Oct 08 00:00:00 CET 2019',
      30000,
      'mW.h',
      'CET',
      [
        {
          idPoint: '1',
          quantity: '3',
          timeStampStart: 'Tue Oct 27 15:35:00 CET 2019',
          timeStampEnd: 'Tue Oct 27 15:35:00 CET 2019'
        }
      ],
      'A37',
      'A30',
      'BSP1',
      'A46',
      'rte',
      'rterole',
      '1234457',
      'IEC France',
      'BSP Mrid',
      'A46',
      'B74',
      'IEC France',
      'IEC France',
      'BSP Mrid',
      'MAW',
      'EUR',
      'MWH',
      'A02',
      'A01',
      'A03',
      '0'
    );
  }
}
