/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {initAndGetMockStub} from '../common/InitChaincode';
import {
  bspOrganization,
  bspOrganizationType,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {BidHelper} from '../helper/Bid.helper';
import {BidMockTransaction} from '../mockControllers/BidMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {QueryResponse} from '../common/QueryResponse';
import {Bid} from '../../src/bid/Bid';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const bid = new BidHelper().createBid('bidIdTest', 'ID_EDA');

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should not be able to create a new bid.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).createBid(bid, tsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create a Bid.'
    );
  });

  it('I should be able to get a bid by Id.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);

    mockStub.setCreator(tsoOrganizationType.mspId);
    const queryResponse: QueryResponse<Bid> = await new BidMockTransaction(
      mockStub
    ).getBidById(bid.bidId, tsoOrganization);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(bid));
  });

  it('I should get back an empty response when id does not exist.', async () => {
    const isErrorExpected = true;
    const queryResponse: QueryResponse<Bid> = await new BidMockTransaction(
      mockStub
    ).getBidById(bid.bidId, tsoOrganization, isErrorExpected);

    expect(queryResponse.message.toString()).equal(
      `Error: ${bid.bidId} does not exist.`
    );
  });
});
