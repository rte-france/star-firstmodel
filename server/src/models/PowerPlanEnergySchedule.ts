/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Point} from './Point';
import * as uuidv4 from 'uuid/v4';

export class PowerPlanEnergySchedule {
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
    public powerPlanEnergyScheduleMrid: string,
    public powerPlanEnergyScheduleStatus: string,
    public curveType: string
  ) {}

  public static postPowerPlanEnergyScheduleFromJSON(
    powerPlanEnergySchedule: PowerPlanEnergySchedule
  ): PowerPlanEnergySchedule {
    return new PowerPlanEnergySchedule(
      'powerPlanEnergySchedule_' + uuidv4(),
      powerPlanEnergySchedule.edpRegisteredResourceId,
      powerPlanEnergySchedule.edpRegisteredResourceMrid,
      powerPlanEnergySchedule.timeIntervalStart,
      powerPlanEnergySchedule.timeIntervalEnd,
      powerPlanEnergySchedule.resolution,
      powerPlanEnergySchedule.pointType,
      powerPlanEnergySchedule.timeZone,
      powerPlanEnergySchedule.timeSeries,
      powerPlanEnergySchedule.powerPlanEnergyScheduleMrid,
      powerPlanEnergySchedule.powerPlanEnergyScheduleStatus,
      powerPlanEnergySchedule.curveType
    );
  }
}
