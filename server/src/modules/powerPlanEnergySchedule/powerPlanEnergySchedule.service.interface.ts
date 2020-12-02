/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {PowerPlanEnergyScheduleDto} from './dto/PowerPlanEnergyScheduleDto';
import {PowerPlanEnergySchedule} from '../../models/PowerPlanEnergySchedule';

export interface IPowerPlanEnergyScheduleService {
  createPowerPlanEnergySchedule(
    powerPlanEnergySchedule: PowerPlanEnergyScheduleDto
  ): Promise<PowerPlanEnergySchedule>;

  createPowerPlanEnergySchedulesFromCSV(
    powerPlanEnergySchedules: PowerPlanEnergyScheduleDto[]
  ): Promise<string[] | object>;

  updatePowerPlanEnergySchedule(
    powerPlanEnergySchedule: PowerPlanEnergyScheduleDto
  ): Promise<PowerPlanEnergySchedule>;

  getPowerPlanEnergyScheduleById(id: string): Promise<PowerPlanEnergySchedule>;

  queryPowerPlanEnergySchedule(
    powerPlanEnergyScheduleQuery: any
  ): Promise<PowerPlanEnergySchedule>;
}
