/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import {Bid} from '../../src/models/Bid';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {loginHelper} from '../helpers/Login.helper';
import {Environment} from '../../config/Environment';
import {EDA} from '../../src/models/EDA';
import {EDAHelper} from '../helpers/EDA.helper';
import {Site} from '../../src/models/Site';
import {SiteHelper} from '../helpers/Site.helper';
import {SiteType} from '../enums/SiteType';
import {BidHelper} from '../helpers/Bid.helper';

let bidId: string;
let bidId2: string;
let bidId3: string;
let edaRegisteredResourceId: string;
let edaRegisteredResourceId2: string;
let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenBSP2: string;
let tokenDSO2: string;
let tokenPRODUCER1: string;

const mockEDA: EDA = new EDAHelper().createEda('BSP1', '7Y778300000I');
const mockEDA2: EDA = new EDAHelper().createEda('BSP2', '7Y778300000I');
const mockMVSite: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO1',
  SiteType.MV,
  'PRM00000000234766',
  'EolienMistral'
);
const mockMVSite2: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO2',
  SiteType.MV,
  'PRM00000000234766',
  'EolienAlize'
);
const mockBid: Bid = new BidHelper().createBid('7Y778300000I');
const mockBid2: Bid = new BidHelper().createBid('7Y778300000I');
const mockBid3: Bid = new BidHelper().createBid('7Y778300000I');

describe('Bid REST test', () => {
  jest.setTimeout(TimeoutDuration.fiftySeconds.valueOf());

  beforeAll(async () => {
    tokenTSO1 = await loginHelper(Environment.baseUrlTSO, 'user.star@tso1.com');
    tokenDSO1 = await loginHelper(Environment.baseUrlDSO, 'user.star@dso1.com');
    tokenBSP1 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp1.com');
    tokenBSP2 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp2.com');
    tokenDSO2 = await loginHelper(
      Environment.baseUrlDSO,
      'user.star@dso2.com'
    );
    tokenPRODUCER1 = await loginHelper(
      Environment.baseUrlPRODUCER,
      'user.star@eolien-mistral.com'
    );
  });

  it('should be able to create a bid as BSP when I have permission', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    edaRegisteredResourceId = createEDAResponse.data.edaRegisteredResourceId;
    mockBid.edaRegisteredResourceId = edaRegisteredResourceId;
    mockMVSite.edaRegisteredResourceId = edaRegisteredResourceId;
    await axios.post(`${Environment.baseUrlDSO}/api/site/`, mockMVSite, {
      headers: {'x-access-token': tokenDSO1}
    });

    const response = await axios.post(
      `${Environment.baseUrlBSP}/api/bid/`,
      mockBid,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const createdBid: Bid = response.data;
    bidId = createdBid.bidId;

    expect(response.status).equal(201);
    expect(createdBid.edaRegisteredResourceId).equal(
      mockBid.edaRegisteredResourceId
    );
    expect(createdBid.edaRegisteredResourceMrid).equal(
      mockBid.edaRegisteredResourceMrid
    );
    expect(createdBid.bidRegisteredResourceMrid).equal(
      mockBid.bidRegisteredResourceMrid
    );
    expect(createdBid.timeIntervalStart).equal(mockBid.timeIntervalStart);
    expect(createdBid.timeIntervalEnd).equal(mockBid.timeIntervalEnd);
    expect(createdBid.resolution).equal(mockBid.resolution);
    expect(createdBid.timeZone).equal(mockBid.timeZone);
    expect(createdBid.pointType).equal(mockBid.pointType);
    expect(createdBid.timeSeries).deep.equal(mockBid.timeSeries);
  });

  it('should be able to create a bid as another BSP when I have permission', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA2,
      {headers: {'x-access-token': tokenTSO1}}
    );

    const edaRegisteredResourceId: string =
      createEDAResponse.data.edaRegisteredResourceId;
    mockBid2.edaRegisteredResourceId = edaRegisteredResourceId;
    mockMVSite2.edaRegisteredResourceId = edaRegisteredResourceId;
    await axios.post(`${Environment.baseUrlDSO}/api/site/`, mockMVSite2, {
      headers: {'x-access-token': tokenDSO2}
    });

    const response = await axios.post(
      `${Environment.baseUrlBSP}/api/bid/`,
      mockBid2,
      {headers: {'x-access-token': tokenBSP2}}
    );
    const createdBid: Bid = response.data;
    bidId2 = createdBid.bidId;

    expect(response.status).equal(201);
    expect(createdBid.edaRegisteredResourceId).equal(
      mockBid2.edaRegisteredResourceId
    );
    expect(createdBid.edaRegisteredResourceMrid).equal(
      mockBid2.edaRegisteredResourceMrid
    );
    expect(createdBid.bidRegisteredResourceMrid).equal(
      mockBid2.bidRegisteredResourceMrid
    );
    expect(createdBid.timeIntervalStart).equal(mockBid2.timeIntervalStart);
    expect(createdBid.timeIntervalEnd).equal(mockBid2.timeIntervalEnd);
    expect(createdBid.resolution).equal(mockBid2.resolution);
    expect(createdBid.timeZone).equal(mockBid2.timeZone);
    expect(createdBid.pointType).equal(mockBid2.pointType);
    expect(createdBid.timeSeries).deep.equal(mockBid2.timeSeries);
  });

  it('should not be able to create a bid as BSP when I do not have permission', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    edaRegisteredResourceId2 = createEDAResponse.data.edaRegisteredResourceId;
    mockBid.edaRegisteredResourceId = edaRegisteredResourceId;
    mockMVSite.edaRegisteredResourceId = edaRegisteredResourceId;
    await axios.post(`${Environment.baseUrlDSO}/api/site/`, mockMVSite, {
      headers: {'x-access-token': tokenDSO1}
    });

    try {
      await axios.post(`${Environment.baseUrlBSP}/api/bid/`, mockBid, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to create Bid.'
      );
    }
  });

  it('should not be able to create a bid as TSO1', async () => {
    try {
      await axios.post(`${Environment.baseUrlTSO}/api/bid/`, mockBid, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a Bid.'
      );
    }
  });

  it('should not be able to create a bid as DSO1', async () => {
    try {
      await axios.post(`${Environment.baseUrlDSO}/api/bid/`, mockBid, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a Bid.'
      );
    }
  });

  it('should not be able to create a bid as PRODUCER', async () => {
    try {
      await axios.post(`${Environment.baseUrlPRODUCER}/api/bid/`, mockBid, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a Bid.'
      );
    }
  });

  it('should not be able to get a bid when the ID does not exist', async () => {
    const nonExistingId = 'NONEXISTINGID';
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/bid/${nonExistingId}`, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `${nonExistingId} does not exist.`
      );
    }
  });

  it('should be able to get a bid as DSO1 when I have the permission.', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/bid/${bidId}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.bidId).equal(bidId);
  });

  it('should not be able to get a bid by id as PRODUCER.', async () => {
    try {
      await axios.get(`${Environment.baseUrlPRODUCER}/api/bid/${bidId}`, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Producer OrganizationType does not have permission to get Bid.`
      );
    }
  });

  it('should not be able to get a bid as DSO1 when I do not have the permission.', async () => {
    try {
      await axios.get(`${Environment.baseUrlDSO}/api/bid/${bidId2}`, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization does not have the permission to get Bid`
      );
    }
  });

  it('should be able to update a bid as BSP when I have the permission', async () => {
    const updateBid: Bid = mockBid;
    updateBid.bidId = bidId;
    updateBid.edaRegisteredResourceId = edaRegisteredResourceId;
    updateBid.resolution = 30005;

    const updateResponse = await axios.put(
      `${Environment.baseUrlBSP}/api/bid/`,
      updateBid,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(updateResponse.status).equal(200);
    expect(updateResponse.data.bidId).equal(bidId);
    expect(updateResponse.data.edaRegisteredResourceId).equal(
      edaRegisteredResourceId
    );
    expect(updateResponse.data.resolution).equal(30005);
  });

  it('should be able to update a bid as DSO1 when I have the permission', async () => {
    const updateBid: Bid = mockBid;
    updateBid.bidId = bidId;
    updateBid.edaRegisteredResourceId = edaRegisteredResourceId;
    updateBid.resolution = 30001;

    const updateResponse = await axios.put(
      `${Environment.baseUrlDSO}/api/bid/`,
      updateBid,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(updateResponse.status).equal(200);
    expect(updateResponse.data.bidId).equal(bidId);
    expect(updateResponse.data.edaRegisteredResourceId).equal(
      edaRegisteredResourceId
    );
    expect(updateResponse.data.resolution).equal(30001);
  });

  it('should be able to get all bids as DSO1 for which I have the permission.', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const edaRegisteredResourceId: string =
      createEDAResponse.data.edaRegisteredResourceId;
    mockBid3.edaRegisteredResourceId = edaRegisteredResourceId;
    mockMVSite2.edaRegisteredResourceId = edaRegisteredResourceId;
    await axios.post(`${Environment.baseUrlDSO}/api/site/`, mockMVSite2, {
      headers: {'x-access-token': tokenDSO2}
    });

    const response = await axios.post(
      `${Environment.baseUrlBSP}/api/bid/`,
      mockBid3,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const createdBid: Bid = response.data;
    bidId3 = createdBid.bidId;

    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/bid/all`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).greaterThan(0);
    expect(queryResponse.data.find((bid) => bid.bidId === bidId)).to.not.be
      .undefined;
    expect(queryResponse.data.find((bid) => bid.bidId === bidId3)).to.be
      .undefined;
  });

  it('should be able to get all bids as BSP for which I have the permission.', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/bid/all`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).greaterThan(0);

    expect(queryResponse.data.find((bid) => bid.bidId === bidId)).to.not.be
      .undefined;
    expect(queryResponse.data.find((bid) => bid.bidId === bidId2)).to.be
      .undefined;
  });

  it('should not be able to get all bids as PRODUCER.', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/bid/all`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).equals(0);
  });

  it('should be able to query bids as BSP for which I have the permission.', async () => {
    const query = `?bidRegisteredResourceMrid=${mockBid.bidRegisteredResourceMrid}`;
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/bid/${query}`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).greaterThan(0);
    expect(queryResponse.data.find((bid) => bid.bidId === bidId)).to.not.be
      .undefined;
    expect(queryResponse.data.find((bid) => bid.bidId === bidId2)).to.be
      .undefined;
  });

  it('should be able to query bids as DSO1 for which I have the permission.', async () => {
    const query = `?bidRegisteredResourceMrid=${mockBid.bidRegisteredResourceMrid}`;
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/bid/${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).greaterThan(0);
    expect(queryResponse.data.find((bid) => bid.bidId === bidId)).to.not.be
      .undefined;
    expect(queryResponse.data.find((bid) => bid.bidId === bidId3)).to.be
      .undefined;
  });

  it('should not be able to receive query bids as PRODUCER.', async () => {
    const query = `?bidRegisteredResourceMrid=${mockBid.bidRegisteredResourceMrid}`;
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/bid/${query}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).equals(0);
  });

  it('should not be able to update a bid as DSO1 when I do not have the permission', async () => {
    const updateBid: Bid = mockBid2;
    updateBid.bidId = bidId2;
    updateBid.edaRegisteredResourceId = edaRegisteredResourceId;
    updateBid.resolution = 1;

    try {
      await axios.put(`${Environment.baseUrlDSO}/api/bid/`, updateBid, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization does not have the permission to update Bid`
      );
    }
  });

  it('should not be able to update a bid as PRODUCER', async () => {
    const updateBid: Bid = mockBid;
    updateBid.bidId = bidId;
    updateBid.edaRegisteredResourceId = edaRegisteredResourceId;
    updateBid.resolution = 1;

    try {
      await axios.put(`${Environment.baseUrlPRODUCER}/api/bid/`, updateBid, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Producer OrganizationType does not have permission to update Bid.`
      );
    }
  });

  it('should not be able to update a bid as BSP when I do not have the permission', async () => {
    const updateBid: Bid = mockBid2;
    updateBid.bidId = bidId2;
    updateBid.edaRegisteredResourceId = edaRegisteredResourceId2;
    updateBid.resolution = 1;

    try {
      await axios.put(`${Environment.baseUrlBSP}/api/bid/`, updateBid, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization does not have the permission to update Bid`
      );
    }
  });
});
