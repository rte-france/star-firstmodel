/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {AssetType} from '../../enums/AssetType';

export class EDA {
  public assetType: AssetType;

  public constructor(
    public edaRegisteredResourceId: string,
    public a46Name: string,
    public edaRegisteredResourceName: string,
    public edaRegisteredResourceMrid: string,
    public a46IEC: string
  ) {
    this.assetType = AssetType.EDA;
  }
}
