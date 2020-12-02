/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {AssetType} from '../../enums/AssetType';

export class LogOrder {
  public assetType: AssetType;

  public constructor(
    public idLogOrdre: string,
    public message: string,
    public type: string,
    public success: boolean,
    public logOrderTimestamp: string,
    public creator: string
  ) {
    this.assetType = AssetType.LogOrder;
  }
}
