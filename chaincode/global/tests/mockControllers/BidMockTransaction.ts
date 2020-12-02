/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {Bid} from '../../src/bid/Bid';
import {IOrganization} from '../../interfaces/IOrganization';
import {QueryResponse} from '../common/QueryResponse';

export class BidMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createBid(
    bid: Bid,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['Bid.createBid', JSON.stringify([bid]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async updateBid(
    bid: Bid,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['Bid.updateBid', JSON.stringify([bid]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async getBidById(
    id: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<Bid>> {
    return mockQuery<Bid>(
      this.mockStub,
      ['Bid.getBid', JSON.stringify([id]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async queryBid(
    query: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<Bid[]>> {
    return mockQuery<Bid[]>(
      this.mockStub,
      ['Bid.queryBid', JSON.stringify([query]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async getAllBids(
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<Bid[]>> {
    return mockQuery<Bid[]>(
      this.mockStub,
      ['Bid.getAllBids', JSON.stringify([]), JSON.stringify(organization)],
      isErrorExpected
    );
  }
}
