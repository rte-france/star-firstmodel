/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {PowerPlanEnergySchedule} from '../../src/powerPlanEnergySchedule/PowerPlanEnergySchedule';
import {IOrganization} from '../../interfaces/IOrganization';
import {QueryResponse} from '../common/QueryResponse';

export class PowerPlanEnergyScheduleMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createPowerPlanEnergySchedule(
    powerPlanEnergySchedule: PowerPlanEnergySchedule,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      [
        'PowerPlanEnergySchedule.createPowerPlanEnergySchedule',
        JSON.stringify([powerPlanEnergySchedule]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async getPowerPlanEnergySchedule(
    id: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<PowerPlanEnergySchedule>> {
    return mockQuery<PowerPlanEnergySchedule>(
      this.mockStub,
      [
        'PowerPlanEnergySchedule.getPowerPlanEnergySchedule',
        JSON.stringify([id]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async queryPowerPlanEnergySchedule(
    query: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<PowerPlanEnergySchedule[]>> {
    return mockQuery<PowerPlanEnergySchedule[]>(
      this.mockStub,
      [
        'PowerPlanEnergySchedule.queryPowerPlanEnergySchedule',
        JSON.stringify([query]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }
}
