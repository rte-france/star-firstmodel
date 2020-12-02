/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import * as uuidv4 from 'uuid/v4';

export class Site {
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
    public producerIEC: string = null
  ) {}

  public static postSiteFromJSON(site: Site): Site {
    return new Site(
      'site_' + uuidv4(),
      site.edaRegisteredResourceId,
      site.nazaRegisteredResourceMrid,
      site.a04RegisteredResourceMrid,
      site.voltageType,
      site.objectAggregationMeteringPoint,
      site.siteName,
      site.siteSIRET,
      site.siteLocation,
      site.a04Name,
      site.siteType,
      site.siteIEC,
      site.producerName,
      site.producerIEC
    );
  }
}
