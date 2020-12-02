/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {AssetType} from '../../enums/AssetType';
import {Point} from '../point/Point';

export class PowerPlanEnergySchedule {
  public assetType: AssetType;

  public constructor(
    public powerPlanEnergyScheduleId: string,
    public edpRegisteredResourceId: string,
    public edpRegisteredResourceMrid: string,
    public timeIntervalStart: string,
    public timeIntervalEnd: string,
    public resolution: number,
    public pointType: string,
    public timeZone: string,
    public timeSeries: Point[],
    public powerPlanEnergyScheduleMrid?: string,
    public powerPlanEnergyScheduleStatus?: string,
    public curveType?: string
  ) {
    this.assetType = AssetType.PowerPlanEnergySchedule;
  }
}
