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
  dsoOrganization,
  dsoOrganizationType,
  otherDSOOrganization,
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {BidHelper} from '../helper/Bid.helper';
import {BidMockTransaction} from '../mockControllers/BidMockTransaction';
import {StatusCode} from '../enums/StatusCode';
import {SiteMockTransaction} from '../mockControllers/SiteMockTransaction';
import {Site} from '../../src/site/Site';
import {SiteHelper} from '../helper/Site.helper';
import {SiteType} from '../../src/site/enums/SiteType';
import {Bid} from '../../src/bid/Bid';
import {EDA} from '../../src/eda/EDA';
import {EDAHelper} from '../helper/EDA.helper';
import {EDAMockTransaction} from '../mockControllers/EDAMockTransaction';
import {QueryResponse} from '../common/QueryResponse';

let mockStub: ChaincodeMockStub;
const mvSite: Site = new SiteHelper().createSite(
  'siteId',
  SiteType.MV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const mvSite2: Site = new SiteHelper().createSite(
  'siteId2',
  SiteType.MV,
  'edaRegisteredResourceId',
  dsoOrganization.organizationId
);
const eda: EDA = new EDAHelper().createEda(
  'ID_EDA',
  bspOrganization.organizationId
);
const eda2: EDA = new EDAHelper().createEda(
  'ID_EDA2',
  bspOrganization.organizationId
);
const bid: Bid = new BidHelper().createBid('bidIdTest', 'ID_EDA');
const bid1: Bid = new BidHelper().createBid('bidIdTest2', 'ID_EDA');
const bid3: Bid = new BidHelper().createBid('bidIdTest3', 'ID_EDA2');

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(dsoOrganizationType.mspId);
  }
);

describe('As DSO ', () => {
  it('I should not be able to create a new bid.', async () => {
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).createBid(bid, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      'OrganizationType is not allowed to create a Bid.'
    );
  });

  it('I should be able to update a bid when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).updateBid(bid, dsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equal(JSON.stringify(bid));
  });

  it('I should not be able to update a bid when I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite2.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const isErrorExpected = true;
    const invokeResponse: ChaincodeResponse = await new BidMockTransaction(
      mockStub
    ).updateBid(bid, dsoOrganization, isErrorExpected);

    expect(invokeResponse.status).equal(StatusCode.INTERNAL_SERVER_ERROR);
    expect(invokeResponse.message.toString()).to.contain(
      `Organization does not have the permission to update Bid`
    );
  });

  it('I should be able to get a bid by Id when I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<Bid> = await new BidMockTransaction(
      mockStub
    ).getBidById(bid.bidId, dsoOrganization);
    expect(JSON.stringify(queryResponse.payload)).equal(JSON.stringify(bid));
  });

  it('I should not be able to get a bid by Id when I do not have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite2.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const isErrorExpected = true;
    const queryResponse: QueryResponse<Bid> = await new BidMockTransaction(
      mockStub
    ).getBidById(bid.bidId, dsoOrganization, isErrorExpected);
    expect(queryResponse.message.toString()).to.contain(
      `Organization does not have the permission to get Bid`
    );
  });

  it('I should be able to query bids for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);
    await new BidMockTransaction(mockStub).createBid(bid1, bspOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<Bid[]> = await new BidMockTransaction(
      mockStub
    ).queryBid(
      JSON.stringify({
        bidRegisteredResourceMrid: bid.bidRegisteredResourceMrid
      }),
      dsoOrganization
    );
    expect(queryResponse.payload.length).equal(2);
    expect(queryResponse.payload[0].bidId).equal(bid.bidId);
    expect(queryResponse.payload[1].bidId).equal(bid1.bidId);
  });

  it('I should be able to get all bids for which I have permission.', async () => {
    mockStub.setCreator(tsoOrganizationType.mspId);
    await new EDAMockTransaction(mockStub).createEDA(eda, tsoOrganization);
    await new EDAMockTransaction(mockStub).createEDA(eda2, tsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite.edaRegisteredResourceId = eda.edaRegisteredResourceId;
    await new SiteMockTransaction(mockStub).createSite(mvSite, dsoOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    mvSite2.edaRegisteredResourceId = eda2.edaRegisteredResourceId;
    mvSite2.a04RegisteredResourceMrid = otherDSOOrganization.organizationId;
    await new SiteMockTransaction(mockStub).createSite(
      mvSite2,
      otherDSOOrganization
    );

    mockStub.setCreator(bspOrganizationType.mspId);
    await new BidMockTransaction(mockStub).createBid(bid, bspOrganization);
    await new BidMockTransaction(mockStub).createBid(bid1, bspOrganization);

    await new BidMockTransaction(mockStub).createBid(bid3, bspOrganization);

    mockStub.setCreator(dsoOrganizationType.mspId);
    const queryResponse: QueryResponse<Bid[]> = await new BidMockTransaction(
      mockStub
    ).getAllBids(dsoOrganization);
    expect(queryResponse.payload.length).equal(2);
    expect(queryResponse.payload[0].bidId).equal(bid.bidId);
    expect(queryResponse.payload[1].bidId).equal(bid1.bidId);
  });
});
