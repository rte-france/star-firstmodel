/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {EDP} from '../../src/models/EDP';

export class EDPHelper {
  public createEdp(edpRegisteredResourceMrid: string): EDP {
    return new EDP(
      'edpRegisteredResourceId',
      'siteId',
      'AZERTY',
      edpRegisteredResourceMrid
    );
  }
}
