/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Site} from '../../src/models/Site';
import {SiteType} from '../enums/SiteType';

export class SiteHelper {
  public createSite(
    nazaRegisteredResourceMrid: string[],
    a04RegisteredResourceMrid: string,
    voltageType: SiteType,
    objectAggregationMeteringPoint: string,
    producerIEC: string
  ): Site {
    return new Site(
      'siteId',
      'edaRegisteredResourceId',
      nazaRegisteredResourceMrid,
      a04RegisteredResourceMrid,
      voltageType,
      objectAggregationMeteringPoint,
      'Parc éolien des baines',
      '800523',
      'Biscarosse',
      'DSO1',
      'Injection',
      'EICTEST',
      'producer',
      producerIEC
    );
  }
}
