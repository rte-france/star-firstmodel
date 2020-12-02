/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {MV} from '../../src/MV/MV';

export class MVHelper {
  public createMV(energyAccountMarketDocumentMrid: string, siteId: string): MV {
    return new MV(
      energyAccountMarketDocumentMrid,
      siteId,
      'sitePRMtest',
      'Tue Oct 27 00:00:00 CET 2019',
      'Tue Oct 27 23:59:59 CET 2019',
      30000,
      'mW.h',
      'CET',
      [
        {
          idPoint: '1',
          quantity: '3 W.h',
          timeStampStart: 'Tue Oct 27 15:35:00 CET 2019',
          timeStampEnd: 'Tue Oct 27 15:40:00 CET 2019'
        }
      ],
      1,
      'A11',
      'A02',
      'A05',
      'A02',
      'MRID DSO',
      'A04',
      'MRID TSO',
      'A48',
      '43243434 ',
      'unitname',
      'codeDomain',
      'EICCode'
    );
  }
}
