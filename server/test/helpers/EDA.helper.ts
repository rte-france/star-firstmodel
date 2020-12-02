/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {EDA} from '../../src/models/EDA';

export class EDAHelper {
  public createEda(a46Name: string, edaRegisteredResourceMrid: string): EDA {
    return new EDA(
      'id',
      a46Name,
      'name_EDA',
      edaRegisteredResourceMrid,
      'code_EIC_BSP'
    );
  }
}
