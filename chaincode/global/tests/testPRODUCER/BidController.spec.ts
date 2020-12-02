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
  otherBSPOrganization,
  producerOrganization,
  producerOrganizationType,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {BidHelper} from '../helper/Bid.helper';
import {BidMockTransaction} from '../mockControllers/BidMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {QueryResponse} from '../common/QueryResponse';
import {Bid} from '../../src/bid/Bid';
import {query} from 'winston';

let mockStub: ChaincodeMockStub;
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const eda2: EDA = new EDAHelper().createEda(
  'ID_EDA2',
  otherBSPOrganization.organizationId
);
const eda3: EDA = new EDAHelper().createEda(
  'ID_EDA3',
  bspOrganization.organizationId
);
const bid = new BidHelper().createBid('bidIdTest', 'ID_EDA');
const bid2 = new BidHelper().createBid('bidIdTest2', 'ID_EDA2');
const bid3 = new BidHelper().createBid('bidIdTest3', 'ID_EDA3');

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(producerOrganizationType.mspId);
  }
);

describe('As PRODUCER ', () => {
  it('I should not be able to create a new bid.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).createBid(bid, producerOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create a Bid.'
    );
  });

  it('I should not be able to update a bid.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda3, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid3, bspOrganization);

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    bid3.resolution = 2;
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).updateBid(bid3, producerOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType does not have permission to update Bid.'
    );
  });

  it('I should not be able to get a bid by Id.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);

    const isErrorExpected = true;
    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<Bid> = await new BidMockTransaction(
      mockStub
    ).getBidById(bid.bidId, producerOrganization, isErrorExpected);

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      'OrganizationType does not have permission to get Bid.'
    );
  });

  it('I should not be able to get all bids by performing a get for all bids.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda3, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);
    await new BidMockTransaction(mockStub).createBid(bid2, otherBSPOrganization);
    await new BidMockTransaction(mockStub).createBid(bid3, bspOrganization);

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<Bid[]> = await new BidMockTransaction(
      mockStub
    ).getAllBids(producerOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(0);
  });

  it('I should not be able to retrieve bids by querying bids.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda3, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);
    await new BidMockTransaction(mockStub).createBid(bid2, otherBSPOrganization);
    await new BidMockTransaction(mockStub).createBid(bid3, bspOrganization);

    mockStub.setCreator(producerOrganizationType.mspId);
    const queryResponse: QueryResponse<Bid[]> = await new BidMockTransaction(
      mockStub
    ).queryBid(
      JSON.stringify({
        bidRegisteredResourceMrid: bid.bidRegisteredResourceMrid
      }),
      producerOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(0);
  });
});
