/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {EDP} from '../../src/edp/EDP';

export class EDPHelper {
  public createEdp(edpRegisteredResourceId: string, siteId: string): EDP {
    return new EDP(edpRegisteredResourceId, siteId, 'AZERTY', '17Y778300000I');
  }
}
