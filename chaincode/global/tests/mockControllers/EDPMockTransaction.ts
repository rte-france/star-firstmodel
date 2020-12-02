/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {EDP} from '../../src/edp/EDP';
import {IOrganization} from '../../interfaces/IOrganization';
import {QueryResponse} from '../common/QueryResponse';

export class EDPMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createEDP(
    edp: EDP,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['EDP.createEDP', JSON.stringify([edp]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async updateEDP(
    edp: EDP,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['EDP.updateEDP', JSON.stringify([edp]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async getEDP(
    id: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<EDP>> {
    return mockQuery<EDP>(
      this.mockStub,
      ['EDP.getEDP', JSON.stringify([id]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async queryEDP(
    query: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<EDP[]>> {
    return mockQuery<EDP[]>(
      this.mockStub,
      ['EDP.queryEDP', JSON.stringify([query]), JSON.stringify(organization)],
      isErrorExpected
    );
  }
}
