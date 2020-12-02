/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {HV} from '../../src/HV/HV';
import {IOrganization} from '../../interfaces/IOrganization';
import {QueryResponse} from '../common/QueryResponse';

export class HVMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createHV(
    hv: HV,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['HV.createHV', JSON.stringify([hv]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async updateHV(
    hv: HV,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['HV.updateHV', JSON.stringify([hv]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async getHVyId(
    id: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<HV>> {
    return mockQuery<HV>(
      this.mockStub,
      ['HV.getHV', JSON.stringify([id]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async queryHV(
    query: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<HV[]>> {
    return mockQuery<HV[]>(
      this.mockStub,
      ['HV.queryHV', JSON.stringify([query]), JSON.stringify(organization)],
      isErrorExpected
    );
  }
}
