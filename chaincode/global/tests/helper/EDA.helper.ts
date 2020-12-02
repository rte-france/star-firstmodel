/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {EDA} from '../../src/eda/EDA';

export class EDAHelper {
  public createEda(edaRegisteredResourceId: string, a46Name: string): EDA {
    return new EDA(
      edaRegisteredResourceId,
      a46Name,
      'name_EDA',
      'code_EDA',
      'code_EIC_BSP'
    );
  }
}
