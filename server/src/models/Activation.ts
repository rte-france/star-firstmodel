/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Point} from './Point';
import {LogOrder} from './LogOrder';

export class Activation {
  public constructor(
    public bspOrganizationId?: string,
    public edaRegisteredResourceMrid?: string,
    public objectAggregationMeteringPoint?: string,
    public siteTypeHT?: string,
    public bidRegisteredResourceMrid?: string,
    public date?: string,
    public nazaOrderId?: string,
    public nazaOrder?: number,
    public siteOrderId?: string,
    public siteOrder?: number,
    public orderBySiteTimestamp?: string,
    public powerPlanEnergyScheduleIds?: string,
    public dataPowerPlanEnergySchedule?: Point[],
    public timeSeries?: Point[],
    public logOrder?: LogOrder[]
  ) {}
}
