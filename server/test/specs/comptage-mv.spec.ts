/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import {MV} from '../../src/models/MV';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {loginHelper} from '../helpers/Login.helper';
import {Environment} from '../../config/Environment';
import {Site} from '../../src/models/Site';
import {SiteHelper} from '../helpers/Site.helper';
import {SiteType} from '../enums/SiteType';
import {MVHelper} from '../helpers/MVHelper';
import {EDAHelper} from '../helpers/EDA.helper';
import {EDA} from '../../src/models/EDA';

let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenDSO2: string;
let tokenPRODUCER1: string;
let mvID: string;
let mvID2: string;

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
const mockMV: MV = new MVHelper().createMV('sitePRMtest');
const mockMV2: MV = new MVHelper().createMV('sitePRM2');

describe('Comptage MV REST test', () => {
  jest.setTimeout(TimeoutDuration.fiftySeconds.valueOf());

  beforeAll(async () => {
    tokenTSO1 = await loginHelper(Environment.baseUrlTSO, 'user.star@tso1.com');
    tokenDSO1 = await loginHelper(Environment.baseUrlDSO, 'user.star@dso1.com');
    tokenBSP1 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp1.com');
    tokenDSO2 = await loginHelper(
      Environment.baseUrlDSO,
      'user.star@dso2.com'
    );
    tokenPRODUCER1 = await loginHelper(
      Environment.baseUrlPRODUCER,
      'user.star@eolien-mistral.com'
    );
  });

  it('should be able to create a Comptage MV as DSO1 when I have the permission', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockMVSite.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    const createSiteResponse = await axios.post(
      `${Environment.baseUrlDSO}/api/site/`,
      mockMVSite,
      {headers: {'x-access-token': tokenDSO1}}
    );
    mockMV.siteId = createSiteResponse.data.siteId;
    const createMVResponse = await axios.post(
      `${Environment.baseUrlDSO}/api/comptage/MV/`,
      mockMV,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const createdMV: MV = createMVResponse.data;
    mvID = createdMV.energyAccountMarketDocumentMrid;

    expect(createMVResponse.status).equal(201);
    expect(createdMV.siteId).equal(mockMV.siteId);
    expect(createdMV.objectAggregationMeteringPoint).equal(
      mockMV.objectAggregationMeteringPoint
    );
    expect(createdMV.timeIntervalStart).equal(mockMV.timeIntervalStart);
    expect(createdMV.timeIntervalEnd).equal(mockMV.timeIntervalEnd);
    expect(createdMV.resolution).equal(mockMV.resolution);
    expect(createdMV.pointType).equal(mockMV.pointType);
    expect(createdMV.timeZone).equal(mockMV.timeZone);
  });

  it('should not be able to create a Comptage MV as TSO1', async () => {
    try {
      await axios.post(`${Environment.baseUrlTSO}/api/comptage/MV/`, mockMV, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create MV.'
      );
    }
  });

  it('should not be able to create a Comptage MV as PRODUCER', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlPRODUCER}/api/comptage/MV/`,
        mockMV,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create MV.'
      );
    }
  });

  it('should not be able to create a Comptage MV as BSP', async () => {
    try {
      await axios.post(`${Environment.baseUrlBSP}/api/comptage/MV/`, mockMV, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create MV.'
      );
    }
  });

  it('should not be able to get an MV by Id when the Id does not exist as TSO1', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlTSO}/api/comptage/MV/NONEXISTINGID`,
        {headers: {'x-access-token': tokenTSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should be able to get an MV by Id as DSO1 when you have permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/comptage/MV/${mvID}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.energyAccountMarketDocumentMrid).equal(mvID);
  });

  it('should be able to get an MV by Id as BSP when you have permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/comptage/MV/${mvID}`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.energyAccountMarketDocumentMrid).equal(mvID);
  });

  it('should be able to get an MV by Id as PRODUCER when you have permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/comptage/MV/${mvID}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.energyAccountMarketDocumentMrid).equal(mvID);
  });

  it('should be able to create multiple Comptage MV as DSO1 when I have the permission', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockMVSite2.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    const createSiteResponse = await axios.post(
      `${Environment.baseUrlDSO}/api/site/`,
      mockMVSite2,
      {headers: {'x-access-token': tokenDSO2}}
    );
    mockMV2.siteId = createSiteResponse.data.siteId;

    const response = await axios.post(
      `${Environment.baseUrlDSO}/api/comptage/MV/`,
      mockMV2,
      {headers: {'x-access-token': tokenDSO2}}
    );
    const createdMV: MV = response.data;
    mvID2 = createdMV.energyAccountMarketDocumentMrid;

    expect(response.status).equal(201);
    expect(createdMV.siteId).equal(mockMV2.siteId);
    expect(createdMV.objectAggregationMeteringPoint).equal(
      mockMV2.objectAggregationMeteringPoint
    );
    expect(createdMV.timeIntervalStart).equal(mockMV2.timeIntervalStart);
    expect(createdMV.timeIntervalEnd).equal(mockMV2.timeIntervalEnd);
    expect(createdMV.resolution).equal(mockMV2.resolution);
    expect(createdMV.pointType).equal(mockMV2.pointType);
    expect(createdMV.timeZone).equal(mockMV2.timeZone);
  });

  it('should not be able to get an MV by Id as DSO1 when you do not have permission', async () => {
    try {
      await axios.get(`${Environment.baseUrlDSO}/api/comptage/MV/${mvID2}`, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get MV.'
      );
    }
  });

  it('should not be able to get an MV by Id as BSP when you do not have permission', async () => {
    try {
      await axios.get(`${Environment.baseUrlBSP}/api/comptage/MV/${mvID2}`, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get MV.'
      );
    }
  });

  it('should not be able to get an MV by Id as PRODUCER when you do not have permission', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlPRODUCER}/api/comptage/MV/${mvID2}`,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get MV.'
      );
    }
  });

  it('should not be able to get a comptage MV with an invalid query parameter', async () => {
    const query = '?siteId=89380920239208923';
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/comptage/MV${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: MV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).equal(0);
  });

  it('should be able to get comptage MVs by query as DSO1 when I have the permission', async () => {
    const query = '?objectAggregationMeteringPoint=sitePRMtest';
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/comptage/MV${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const queryResponse: MV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find((mv) => mv.energyAccountMarketDocumentMrid === mvID)
    ).to.not.be.undefined;
    expect(
      queryResponse.find((mv) => mv.energyAccountMarketDocumentMrid === mvID2)
    ).to.be.undefined;
  });

  it('should be able to get comptage MVs by query as BSP when I have the permission', async () => {
    const query = '?objectAggregationMeteringPoint=sitePRMtest';
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/comptage/MV${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const queryResponse: MV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find((mv) => mv.energyAccountMarketDocumentMrid === mvID)
    ).to.not.be.undefined;
    expect(
      queryResponse.find((mv) => mv.energyAccountMarketDocumentMrid === mvID2)
    ).to.be.undefined;
  });

  it('should be able to get comptage MVs by query as PRODUCER when I have the permission', async () => {
    const query = '?objectAggregationMeteringPoint=sitePRMtest';
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/comptage/MV${query}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    const queryResponse: MV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find((mv) => mv.energyAccountMarketDocumentMrid === mvID)
    ).to.not.be.undefined;
    expect(
      queryResponse.find((mv) => mv.energyAccountMarketDocumentMrid === mvID2)
    ).to.be.undefined;
  });

  it('should be able to update a Comptage MV as DSO1 when I have the permission', async () => {
    const updateMVObject: MV = mockMV;
    updateMVObject.energyAccountMarketDocumentMrid = mvID;

    const newResolution = 30500;
    updateMVObject.resolution = newResolution;

    const response = await axios.put(
      `${Environment.baseUrlDSO}/api/comptage/MV/`,
      updateMVObject,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const updatedMV: MV = response.data;

    expect(response.status).equal(200);
    expect(updatedMV.energyAccountMarketDocumentMrid).equal(
      updateMVObject.energyAccountMarketDocumentMrid
    );
    expect(updatedMV.resolution).equal(newResolution);
  });

  it('should be able to update a Comptage MV as DSO1 when I have the permission', async () => {
    const updateMVObject: MV = mockMV2;
    updateMVObject.energyAccountMarketDocumentMrid = mvID2;

    try {
      await axios.put(
        `${Environment.baseUrlDSO}/api/comptage/MV/`,
        updateMVObject,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to update MV.'
      );
    }
  });

  it('should be able to update a Comptage MV as BSP when I have permission', async () => {
    mockMV.resolution = 30005;

    const updateResponse = await axios.put(
      `${Environment.baseUrlBSP}/api/comptage/MV/`,
      mockMV,
      {headers: {'x-access-token': tokenBSP1}}
    );
    expect(updateResponse.status).equal(200);
    expect(updateResponse.data.resolution).equal(30005);
  });

  it('should not be able to update a Comptage MV as BSP when I do not have permission', async () => {
    try {
      await axios.put(`${Environment.baseUrlBSP}/api/comptage/MV/`, mockMV2, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to update MV.'
      );
    }
  });

  it('should be able to update a Comptage MV as PRODUCER when I have permission', async () => {
    mockMV.resolution = 30010;

    const updateResponse = await axios.put(
      `${Environment.baseUrlPRODUCER}/api/comptage/MV/`,
      mockMV,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    expect(updateResponse.status).equal(200);
    expect(updateResponse.data.resolution).equal(30010);
  });

  it('should not be able to update a Comptage MV as PRODUCER when I do not have permission', async () => {
    try {
      await axios.put(
        `${Environment.baseUrlPRODUCER}/api/comptage/MV/`,
        mockMV2,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to update MV.'
      );
    }
  });

  it('should not be able to update a Comptage MV as TSO1', async () => {
    try {
      await axios.put(`${Environment.baseUrlTSO}/api/comptage/MV/`, mockMV, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to update MV.'
      );
    }
  });
});
