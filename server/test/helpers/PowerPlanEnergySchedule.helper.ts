/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {PowerPlanEnergySchedule} from '../../src/models/PowerPlanEnergySchedule';

export class PowerPlanEnergyScheduleHelper {
  public createPowerPlanEnergySchedule(
    edpRegisteredResourceMrid: string
  ): PowerPlanEnergySchedule {
    return new PowerPlanEnergySchedule(
      'powerPlanEnergyScheduleId',
      'edpRegisteredResourceId',
      edpRegisteredResourceMrid,
      '1572134400',
      '1572220799',
      30000,
      'mW.h',
      'CET',
      [
        {
          idPoint: '1',
          quantity: '3 W.h',
          timeStampStart: '1572134400',
          timeStampEnd: '1572134700'
        },
        {
          idPoint: '1',
          quantity: '3 W.h',
          timeStampStart: '1572186600',
          timeStampEnd: '1572186900'
        }
      ],
      'PA_AURPDT_20200211',
      'planned',
      'A03'
    );
  }
}
