/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import * as uuidv4 from 'uuid/v4';

export class EDP {
  public constructor(
    public edpRegisteredResourceId: string,
    public siteId: string,
    public edpRegisteredResourceName: string,
    public edpRegisteredResourceMrid: string
  ) {}

  public static postEDPFromJSON(edp: EDP): EDP {
    return new EDP(
      'edp_' + uuidv4(),
      edp.siteId,
      edp.edpRegisteredResourceName,
      edp.edpRegisteredResourceMrid
    );
  }
}
