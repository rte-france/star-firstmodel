/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {AssetType} from '../../enums/AssetType';

export class Site {
  public assetType: AssetType;

  public constructor(
    public siteId: string,
    public edaRegisteredResourceId: string,
    public nazaRegisteredResourceMrid: string[],
    public a04RegisteredResourceMrid: string,
    public voltageType: string,
    public objectAggregationMeteringPoint: string,
    public siteName: string,
    public siteSIRET: string,
    public siteLocation: string,
    public a04Name: string,
    public siteType: string,
    public siteIEC: string,
    public producerName: string,
    public producerIEC: string
  ) {
    this.assetType = AssetType.Site;
  }
}
