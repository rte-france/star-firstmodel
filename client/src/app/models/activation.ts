/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {LogOrder} from './LogOrder';
import {Point} from './Point';

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
    public selected?: boolean,
    public powerPlanEnergyScheduleId?: string,
    public dataPowerPlanEnergySchedule?: Point[],
    public timeSeries?: Point[],
    public logOrder?: LogOrder[]
  ) {}
}
