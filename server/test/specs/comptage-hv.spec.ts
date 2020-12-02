/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import {HV} from '../../src/models/HV';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {loginHelper} from '../helpers/Login.helper';
import {Environment} from '../../config/Environment';
import {Site} from '../../src/models/Site';
import {SiteHelper} from '../helpers/Site.helper';
import {SiteType} from '../enums/SiteType';
import {HVHelper} from '../helpers/HV.helper';
import {EDA} from '../../src/models/EDA';
import {EDAHelper} from '../helpers/EDA.helper';

let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenDSO2: string;
let tokenPRODUCER1: string;
let hvID: string;
let hvID2: string;

const mockEDA: EDA = new EDAHelper().createEda('BSP1', '7Y778300000I');
const mockEDA2: EDA = new EDAHelper().createEda('BSP2', '7Y778300000I');
const mockHVSite: Site = new SiteHelper().createSite(
  ['automate100'],
  'DSO1',
  SiteType.HV,
  'PRM00000000234766',
  'EolienMistral'
);
const mockHVSite2: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO2',
  SiteType.HV,
  'siteId123',
  'EolienAlize'
);
const mockHV: HV = new HVHelper().createHV('sitePPE5');
const mockHV2: HV = new HVHelper().createHV('sitePPE5');

describe('Comptage HV REST test', () => {
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

  it('should be able to create a Comptage HV as TSO1', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockHVSite.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    const createSiteResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/site/`,
      mockHVSite,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockHV.siteId = createSiteResponse.data.siteId;
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/comptage/HV/`,
      mockHV,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdHV: HV = response.data;
    hvID = createdHV.energyAccountMarketDocumentMrid;

    expect(response.status).equal(201);
    expect(createdHV.siteId).equal(mockHV.siteId);
    expect(createdHV.ppeSiteCode).equal(mockHV.ppeSiteCode);
    expect(createdHV.timeIntervalStart).equal(mockHV.timeIntervalStart);
    expect(createdHV.timeIntervalEnd).equal(mockHV.timeIntervalEnd);
    expect(createdHV.resolution).equal(mockHV.resolution);
    expect(createdHV.pointType).equal(mockHV.pointType);
    expect(createdHV.timeZone).equal(mockHV.timeZone);
  });

  it('should be able to create multiple Comptage HV', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockHVSite2.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    const createSiteResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/site/`,
      mockHVSite2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockHV2.energyAccountMarketDocumentMrid =
      createSiteResponse.data.energyAccountMarketDocumentMrid;
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/comptage/HV/`,
      mockHV2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdHV: HV = response.data;
    hvID2 = createdHV.energyAccountMarketDocumentMrid;

    expect(response.status).equal(201);
    expect(createdHV.siteId).equal(mockHV2.siteId);
    expect(createdHV.ppeSiteCode).equal(mockHV2.ppeSiteCode);
    expect(createdHV.timeIntervalStart).equal(mockHV2.timeIntervalStart);
    expect(createdHV.timeIntervalEnd).equal(mockHV2.timeIntervalEnd);
    expect(createdHV.resolution).equal(mockHV2.resolution);
    expect(createdHV.pointType).equal(mockHV2.pointType);
    expect(createdHV.timeZone).equal(mockHV2.timeZone);
  });

  it('should not be able to create a Comptage HV as DSO1', async () => {
    try {
      await axios.post(`${Environment.baseUrlDSO}/api/comptage/HV/`, mockHV, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create HV.'
      );
    }
  });

  it('should not be able to create a Comptage HV as BSP', async () => {
    try {
      await axios.post(`${Environment.baseUrlBSP}/api/comptage/HV/`, mockHV, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create HV.'
      );
    }
  });

  it('should not be able to create a Comptage HV as PRODUCER', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlPRODUCER}/api/comptage/HV/`,
        mockHV,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create HV.'
      );
    }
  });

  it('should not be able to get an HV when the ID does not exist', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlTSO}/api/comptage/HV/NONEXISTINGID`,
        {headers: {'x-access-token': tokenTSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should not be able to get a comptage HV with an invalid query parameter', async () => {
    const query = '?siteId=89380920239208923';
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/comptage/HV${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: HV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).equal(0);
  });

  it('should be able to get comptage HVs by query as DSO1 when I have the permission', async () => {
    const query = '?ppeSiteCode=sitePPE5';
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/comptage/HV${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const queryResponse: HV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find((hv) => hv.energyAccountMarketDocumentMrid === hvID)
    ).to.not.be.undefined;
    expect(
      queryResponse.find((hv) => hv.energyAccountMarketDocumentMrid === hvID2)
    ).to.be.undefined;
  });

  it('should be able to get comptage HVs by query as BSP when I have the permission', async () => {
    const query = '?ppeSiteCode=sitePPE5';
    const response = await axios.get(
      `${Environment.baseUrlBSP}/api/comptage/HV${query}`,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const queryResponse: HV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find((hv) => hv.energyAccountMarketDocumentMrid === hvID)
    ).to.not.be.undefined;
    expect(
      queryResponse.find((hv) => hv.energyAccountMarketDocumentMrid === hvID2)
    ).to.be.undefined;
  });

  it('should be able to get comptage HVs by query as PRODUCER when I have the permission', async () => {
    const query = '?ppeSiteCode=sitePPE5';
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/comptage/HV${query}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    const queryResponse: HV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find((hv) => hv.energyAccountMarketDocumentMrid === hvID)
    ).to.not.be.undefined;
    expect(
      queryResponse.find((hv) => hv.energyAccountMarketDocumentMrid === hvID2)
    ).to.be.undefined;
  });

  it('should be able to get comptage HVs by query as TSO1', async () => {
    const query = '?ppeSiteCode=sitePPE5';
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/comptage/HV${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: HV[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find((hv) => hv.energyAccountMarketDocumentMrid === hvID)
    ).to.not.be.undefined;
    expect(
      queryResponse.find((hv) => hv.energyAccountMarketDocumentMrid === hvID2)
    ).to.not.be.undefined;
  });

  it('should be able to get an HV by Id as TSO1', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlTSO}/api/comptage/HV/${hvID}`,
      {headers: {'x-access-token': tokenTSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.energyAccountMarketDocumentMrid).equal(hvID);
  });

  it('should be able to get an HV by Id as DSO1 when I have the permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/comptage/HV/${hvID}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.energyAccountMarketDocumentMrid).equal(hvID);
  });

  it('should be able to get an HV by Id as BSP when I have the permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/comptage/HV/${hvID}`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.energyAccountMarketDocumentMrid).equal(hvID);
  });

  it('should be able to get an HV by Id as PRODUCER when I have the permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/comptage/HV/${hvID}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.energyAccountMarketDocumentMrid).equal(hvID);
  });

  it('should not be able to get an HV by Id as DSO1 when I do not have the permission', async () => {
    try {
      await axios.get(`${Environment.baseUrlDSO}/api/comptage/HV/${hvID2}`, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get HV.'
      );
    }
  });

  it('should not be able to get an HV by Id as BSP when I do not have the permission', async () => {
    try {
      await axios.get(`${Environment.baseUrlBSP}/api/comptage/HV/${hvID2}`, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get HV.'
      );
    }
  });

  it('should not be able to get an HV by Id as PRODUCER when I do not have the permission', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlPRODUCER}/api/comptage/HV/${hvID2}`,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get HV.'
      );
    }
  });

  it('should be able to update a Comptage HV as TSO1', async () => {
    const updateHVObject: HV = mockHV;
    updateHVObject.energyAccountMarketDocumentMrid = hvID;

    const newResolution = 30005;
    updateHVObject.resolution = newResolution;

    const response = await axios.put(
      `${Environment.baseUrlTSO}/api/comptage/HV/`,
      updateHVObject,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const updatedHV: HV = response.data;

    expect(response.status).equal(200);
    expect(updatedHV.energyAccountMarketDocumentMrid).equal(
      updateHVObject.energyAccountMarketDocumentMrid
    );
    expect(updatedHV.resolution).equal(newResolution);
  });

  it('should be able to update a Comptage HV as BSP when I have the permission', async () => {
    const updateHVObject: HV = mockHV;
    updateHVObject.energyAccountMarketDocumentMrid = hvID;

    const newResolution = 30005;
    updateHVObject.resolution = newResolution;

    const response = await axios.put(
      `${Environment.baseUrlBSP}/api/comptage/HV/`,
      updateHVObject,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const updatedHV: HV = response.data;

    expect(response.status).equal(200);
    expect(updatedHV.energyAccountMarketDocumentMrid).equal(
      updateHVObject.energyAccountMarketDocumentMrid
    );
    expect(updatedHV.resolution).equal(newResolution);
  });

  it('should be able to update a Comptage HV as PRODUCER when I have the permission', async () => {
    const updateHVObject: HV = mockHV;
    updateHVObject.energyAccountMarketDocumentMrid = hvID;

    const newResolution = 30010;
    updateHVObject.resolution = newResolution;

    const response = await axios.put(
      `${Environment.baseUrlPRODUCER}/api/comptage/HV/`,
      updateHVObject,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    const updatedHV: HV = response.data;

    expect(response.status).equal(200);
    expect(updatedHV.energyAccountMarketDocumentMrid).equal(
      updateHVObject.energyAccountMarketDocumentMrid
    );
    expect(updatedHV.resolution).equal(newResolution);
  });

  it('should not be able to update a Comptage HV as BSP when I do not have permission', async () => {
    try {
      await axios.put(`${Environment.baseUrlBSP}/api/comptage/HV/`, mockHV2, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to update HV.'
      );
    }
  });

  it('should not be able to update a Comptage HV as PRODUCER when I do not have permission', async () => {
    try {
      await axios.put(
        `${Environment.baseUrlPRODUCER}/api/comptage/HV/`,
        mockHV2,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to update HV.'
      );
    }
  });

  it('should not be able to update a Comptage HV as DSO1', async () => {
    try {
      await axios.put(`${Environment.baseUrlDSO}/api/comptage/HV/`, mockHV, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to update HV.'
      );
    }
  });
});
