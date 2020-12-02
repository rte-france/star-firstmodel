/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {AssetType} from '../../enums/AssetType';

export class EDP {
  public assetType: AssetType;

  public constructor(
    public edpRegisteredResourceId: string,
    public siteId: string,
    public edpRegisteredResourceName: string,
    public edpRegisteredResourceMrid: string
  ) {
    this.assetType = AssetType.EDP;
  }
}
