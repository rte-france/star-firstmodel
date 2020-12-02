/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HV} from '../../src/models/HV';

export class HVHelper {
  public createHV(ppeSiteCode: string): HV {
    return new HV(
      'idComptage',
      'siteId',
      ppeSiteCode,
      '1572134400',
      '1572220799',
      30000,
      'mW.h',
      'CET',
      [
        {
          idPoint: '1',
          quantity: '3 W.h',
          timeStampStart: '1572134400',
          timeStampEnd: '1572134700'
        },
        {
          idPoint: '1',
          quantity: '3 W.h',
          timeStampStart: '1572186600',
          timeStampEnd: '1572186900'
        }
      ],
      1,
      'A11',
      'A02',
      'A05',
      'A02',
      'MRID TSO',
      'A48',
      'MRID TSO',
      'A48',
      '12321312',
      'unitname',
      'codeDomain',
      'EICCode'
    );
  }
}
