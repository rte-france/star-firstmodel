/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {MV} from '../../src/MV/MV';
import {IOrganization} from '../../interfaces/IOrganization';
import {QueryResponse} from '../common/QueryResponse';

export class MVMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createMV(
    mv: MV,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['MV.createMV', JSON.stringify([mv]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async updateMV(
    mv: MV,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['MV.updateMV', JSON.stringify([mv]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async getMVById(
    id: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<MV>> {
    return mockQuery<MV>(
      this.mockStub,
      ['MV.getMV', JSON.stringify([id]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async queryMV(
    query: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<MV[]>> {
    return mockQuery<MV[]>(
      this.mockStub,
      ['MV.queryMV', JSON.stringify([query]), JSON.stringify(organization)],
      isErrorExpected
    );
  }
}
