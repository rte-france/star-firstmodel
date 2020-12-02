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
    mockStub = await initAndGetMockStub(bspOrganizationType.mspId);
  }
);

describe('As BSP ', () => {
  it('I should be able to create a new bid when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).createBid(bid, bspOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(bid));
  });

  it('I should not be able to create a new bid when I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).createBid(bid2, bspOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `Organization does not have the permission to create Bid.`
    );
  });

  it('I should be able to update a bid when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda3, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid3, bspOrganization);

    bid3.resolution = 2;
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).updateBid(bid3, bspOrganization);
    const updatedBid: Bid = JSON.parse(invokeResponse.payload.toString());

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedBid.bidId).equal(bid3.bidId);
    expect(updatedBid.resolution).equal(2);
  });

  it('I should not be able to update a bid for which I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid2, otherBSPOrganization);

    bid3.resolution = 2;
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).updateBid(bid2, bspOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `BSP Organization does not have the permission to update Bid.`
    );
  });

  it('I should be able to get a bid by Id when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);

    const queryResponse: QueryResponse<Bid> = await new BidMockTransaction(
      mockStub
    ).getBidById(bid.bidId, bspOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(bid));
  });

  it('I should not be able to get a bid by Id when I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid2, otherBSPOrganization);

    const isErrorExpected = true;
    const queryResponse: QueryResponse<Bid> = await new BidMockTransaction(
      mockStub
    ).getBidById(bid2.bidId, bspOrganization, isErrorExpected);

    expect(queryResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(queryResponse.message.toString()).to.contain(
      `Organization does not have the permission to get Bid.`
    );
  });

  it('I should be able to get all bids for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda3, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);
    await new BidMockTransaction(mockStub).createBid(bid2, otherBSPOrganization);
    await new BidMockTransaction(mockStub).createBid(bid3, bspOrganization);

    const queryResponse: QueryResponse<Bid[]> = await new BidMockTransaction(
      mockStub
    ).getAllBids(bspOrganization);

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(2);
  });

  it('I should be able to query bids for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda3, tsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);
    await new BidMockTransaction(mockStub).createBid(bid2, otherBSPOrganization);
    await new BidMockTransaction(mockStub).createBid(bid3, bspOrganization);

    const queryResponse: QueryResponse<Bid[]> = await new BidMockTransaction(
      mockStub
    ).queryBid(
      JSON.stringify({
        bidRegisteredResourceMrid: bid.bidRegisteredResourceMrid
      }),
      bspOrganization
    );

    expect(queryResponse.status).equal(StatusCode.SUCCESS);
    expect(queryResponse.payload.length).equal(2);
  });
});
