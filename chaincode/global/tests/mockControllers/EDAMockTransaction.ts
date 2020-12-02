/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {EDA} from '../../src/eda/EDA';
import {IOrganization} from '../../interfaces/IOrganization';
import {QueryResponse} from '../common/QueryResponse';

export class EDAMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createEDA(
    eda: EDA,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['EDA.createEDA', JSON.stringify([eda]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async updateEDA(
    eda: EDA,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['EDA.updateEDA', JSON.stringify([eda]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async getEDAById(
    id: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<EDA>> {
    return mockQuery<EDA>(
      this.mockStub,
      ['EDA.getEDAbyId', JSON.stringify([id]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async getAllEDAs(
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<EDA>> {
    return mockQuery<EDA>(
      this.mockStub,
      ['EDA.getAllEDAs', JSON.stringify([]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async queryEDAs(
    query: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<EDA>> {
    return mockQuery<EDA>(
      this.mockStub,
      ['EDA.queryEDA', JSON.stringify([query]), JSON.stringify(organization)],
      isErrorExpected
    );
  }
}
