/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {PowerPlanEnergySchedule} from '../../src/powerPlanEnergySchedule/PowerPlanEnergySchedule';

export class PowerPlanEnergyScheduleHelper {
  public createPowerPlanEnergySchedule(
    powerPlanEnergyScheduleId: string,
    edpRegisteredResourceId: string
  ): PowerPlanEnergySchedule {
    return new PowerPlanEnergySchedule(
      powerPlanEnergyScheduleId,
      edpRegisteredResourceId,
      'edpRegisteredResourceMrid',
      'Tue Oct 27 00:00:00 CET 2019',
      'Tue Oct 27 23:59:59 CET 2019',
      30000,
      'mW.h',
      'CET',
      [
        {
          idPoint: '1',
          quantity: '3 W.h',
          timeStampStart: 'Tue Oct 27 15:35:00 CET 2019',
          timeStampEnd: 'Tue Oct 27 15:40:00 CET 2019'
        }
      ],
      'PA_AURPDT_20200211',
      'planned',
      'A03'
    );
  }
}
