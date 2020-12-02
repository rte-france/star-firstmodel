/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import {PowerPlanEnergySchedule} from '../../src/models/PowerPlanEnergySchedule';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {loginHelper} from '../helpers/Login.helper';
import {Environment} from '../../config/Environment';
import {PowerPlanEnergyScheduleHelper} from '../helpers/PowerPlanEnergySchedule.helper';
import {Site} from '../../src/models/Site';
import {SiteHelper} from '../helpers/Site.helper';
import {SiteType} from '../enums/SiteType';
import {EDP} from '../../src/models/EDP';
import {EDPHelper} from '../helpers/EDP.helper';
import {EDA} from '../../src/models/EDA';
import {EDAHelper} from '../helpers/EDA.helper';

let powerPlanEnergyScheduleId: string;
let powerPlanEnergyScheduleId2: string;
let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenBSP2: string;
let tokenDSO2: string;
let tokenPRODUCER1: string;

const mockEDA: EDA = new EDAHelper().createEda('BSP1', '7Y778300000I');
const mockEDA2: EDA = new EDAHelper().createEda('BSP2', '7Y778300000I');

const mockPowerPlanEnergySchedule: PowerPlanEnergySchedule = new PowerPlanEnergyScheduleHelper().createPowerPlanEnergySchedule(
  'edpRegisteredResourceMrid'
);
const mockPowerPlanEnergySchedule2: PowerPlanEnergySchedule = new PowerPlanEnergyScheduleHelper().createPowerPlanEnergySchedule(
  '89370633'
);

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

const mockEDP: EDP = new EDPHelper().createEdp('edpRegisteredResourceMrid');
const mockEDP2: EDP = new EDPHelper().createEdp('edpRegisteredResourceMrid');

describe('PowerPlanEnergySchedule REST test', () => {
  jest.setTimeout(TimeoutDuration.fiftySeconds.valueOf());

  beforeAll(async () => {
    tokenTSO1 = await loginHelper(Environment.baseUrlTSO, 'user.star@tso1.com');
    tokenDSO1 = await loginHelper(Environment.baseUrlDSO, 'user.star@dso1.com');
    tokenBSP1 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp1.com');
    tokenDSO2 = await loginHelper(
      Environment.baseUrlDSO,
      'user.star@dso2.com'
    );
    tokenBSP2 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp2.com');
    tokenPRODUCER1 = await loginHelper(
      Environment.baseUrlPRODUCER,
      'user.star@eolien-mistral.com'
    );
  });

  it('should be able to create a PowerPlanEnergySchedule as BSP when I have permission', async () => {
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

    mockEDP.siteId = createSiteResponse.data.siteId;
    const createEDPResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/edp/`,
      mockEDP,
      {headers: {'x-access-token': tokenTSO1}}
    );

    mockPowerPlanEnergySchedule.edpRegisteredResourceId =
      createEDPResponse.data.edpRegisteredResourceId;
    const response = await axios.post(
      `${Environment.baseUrlBSP}/api/powerPlanEnergySchedule/`,
      mockPowerPlanEnergySchedule,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const createdPowerPlanEnergySchedule: PowerPlanEnergySchedule =
      response.data;
    powerPlanEnergyScheduleId =
      createdPowerPlanEnergySchedule.powerPlanEnergyScheduleId;

    expect(response.status).equal(201);
    expect(createdPowerPlanEnergySchedule.edpRegisteredResourceId).equal(
      mockPowerPlanEnergySchedule.edpRegisteredResourceId
    );
    expect(createdPowerPlanEnergySchedule.edpRegisteredResourceMrid).equal(
      mockPowerPlanEnergySchedule.edpRegisteredResourceMrid
    );
    expect(createdPowerPlanEnergySchedule.timeIntervalStart).equal(
      mockPowerPlanEnergySchedule.timeIntervalStart
    );
    expect(createdPowerPlanEnergySchedule.timeIntervalEnd).equal(
      mockPowerPlanEnergySchedule.timeIntervalEnd
    );
    expect(createdPowerPlanEnergySchedule.resolution).equal(
      mockPowerPlanEnergySchedule.resolution
    );
    expect(createdPowerPlanEnergySchedule.pointType).equal(
      mockPowerPlanEnergySchedule.pointType
    );
    expect(createdPowerPlanEnergySchedule.timeZone).equal(
      mockPowerPlanEnergySchedule.timeZone
    );
  });

  it('should not be able to create a PowerPlanEnergySchedule as TSO1', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlTSO}/api/powerPlanEnergySchedule/`,
        mockPowerPlanEnergySchedule,
        {headers: {'x-access-token': tokenTSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a PowerPlanEnergySchedule.'
      );
    }
  });

  it('should not be able to create a PowerPlanEnergySchedule as DSO1', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlDSO}/api/powerPlanEnergySchedule/`,
        mockPowerPlanEnergySchedule,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a PowerPlanEnergySchedule.'
      );
    }
  });

  it('should not be able to create a PowerPlanEnergySchedule as a Producer', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlPRODUCER}/api/powerPlanEnergySchedule/`,
        mockPowerPlanEnergySchedule,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a PowerPlanEnergySchedule.'
      );
    }
  });

  it('should be able to get a PowerPlanEnergySchedule by id as TSO1', async () => {
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/powerPlanEnergySchedule/${powerPlanEnergyScheduleId}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const powerPlanEnergySchedule: PowerPlanEnergySchedule = response.data;

    expect(response.status).equal(200);
    expect(powerPlanEnergySchedule.powerPlanEnergyScheduleId).equal(
      powerPlanEnergyScheduleId
    );
  });

  it('should be able to get a PowerPlanEnergySchedule by id as DSO1 when I have permission.', async () => {
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/powerPlanEnergySchedule/${powerPlanEnergyScheduleId}`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const powerPlanEnergySchedule: PowerPlanEnergySchedule = response.data;

    expect(response.status).equal(200);
    expect(powerPlanEnergySchedule.powerPlanEnergyScheduleId).equal(
      powerPlanEnergyScheduleId
    );
  });

  it('should be able to get a PowerPlanEnergySchedule by id as BSP when I have permission.', async () => {
    const response = await axios.get(
      `${Environment.baseUrlBSP}/api/powerPlanEnergySchedule/${powerPlanEnergyScheduleId}`,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const powerPlanEnergySchedule: PowerPlanEnergySchedule = response.data;

    expect(response.status).equal(200);
    expect(powerPlanEnergySchedule.powerPlanEnergyScheduleId).equal(
      powerPlanEnergyScheduleId
    );
  });

  it('should not be able to get a PowerPlanEnergySchedule as TSO1 when the ID does not exist', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlTSO}/api/powerPlanEnergySchedule/NONEXISTINGID`,
        {headers: {'x-access-token': tokenTSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'NONEXISTINGID does not exist.'
      );
    }
  });

  it('should not be able to get a PowerPlanEnergySchedule as a Producer', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlPRODUCER}/api/powerPlanEnergySchedule/${powerPlanEnergyScheduleId}`,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType does not have permission to get this PowerPlanEnergySchedule.'
      );
    }
  });

  it('should be able to create another PowerPlanEnergySchedule as BSP when a different organization has permission', async () => {
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
    mockEDP2.siteId = createSiteResponse.data.siteId;
    const createEDPResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/edp/`,
      mockEDP2,
      {headers: {'x-access-token': tokenTSO1}}
    );

    mockPowerPlanEnergySchedule2.edpRegisteredResourceId =
      createEDPResponse.data.edpRegisteredResourceId;
    const response = await axios.post(
      `${Environment.baseUrlBSP}/api/powerPlanEnergySchedule/`,
      mockPowerPlanEnergySchedule2,
      {headers: {'x-access-token': tokenBSP2}}
    );
    const createdPowerPlanEnergySchedule: PowerPlanEnergySchedule =
      response.data;
    powerPlanEnergyScheduleId2 =
      createdPowerPlanEnergySchedule.powerPlanEnergyScheduleId;

    expect(response.status).equal(201);
    expect(createdPowerPlanEnergySchedule.edpRegisteredResourceId).equal(
      mockPowerPlanEnergySchedule2.edpRegisteredResourceId
    );
    expect(createdPowerPlanEnergySchedule.edpRegisteredResourceMrid).equal(
      mockPowerPlanEnergySchedule2.edpRegisteredResourceMrid
    );
    expect(createdPowerPlanEnergySchedule.timeIntervalStart).equal(
      mockPowerPlanEnergySchedule2.timeIntervalStart
    );
    expect(createdPowerPlanEnergySchedule.timeIntervalEnd).equal(
      mockPowerPlanEnergySchedule2.timeIntervalEnd
    );
    expect(createdPowerPlanEnergySchedule.resolution).equal(
      mockPowerPlanEnergySchedule2.resolution
    );
    expect(createdPowerPlanEnergySchedule.pointType).equal(
      mockPowerPlanEnergySchedule2.pointType
    );
    expect(createdPowerPlanEnergySchedule.timeZone).equal(
      mockPowerPlanEnergySchedule2.timeZone
    );
  });

  it('should not be able to get a PowerPlanEnergySchedule by id as DSO1 when I do not have permission.', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlDSO}/api/powerPlanEnergySchedule/${powerPlanEnergyScheduleId}`,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get PowerPlanEnergySchedule'
      );
    }
  });

  it('should not be able to get a PowerPlanEnergySchedule by id as BSP when I do not have permission.', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlBSP}/api/powerPlanEnergySchedule/${powerPlanEnergyScheduleId}`,
        {headers: {'x-access-token': tokenBSP1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get PowerPlanEnergySchedule'
      );
    }
  });

  it('should be able to get PowerPlanEnergySchedules with a query parameter as TSO1', async () => {
    const query = '?edpRegisteredResourceMrid=edpRegisteredResourceMrid';
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/powerPlanEnergySchedule${query}`,
      {
        headers: {'x-access-token': tokenTSO1}
      }
    );
    const queryResponse: PowerPlanEnergySchedule[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse[0].edpRegisteredResourceMrid).equal(
      mockPowerPlanEnergySchedule.edpRegisteredResourceMrid
    );
  });

  it('should be able to query PowerPlanEnergySchedules as DSO1 for which I have permission', async () => {
    const query = '?edpRegisteredResourceMrid=edpRegisteredResourceMrid';
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/powerPlanEnergySchedule${query}`,
      {
        headers: {'x-access-token': tokenDSO1}
      }
    );
    const queryResponse: PowerPlanEnergySchedule[] = response.data;

    expect(response.status).equal(200);
    expect(
      queryResponse.find(
        (powerPlanEnergySchedule) =>
          powerPlanEnergySchedule.powerPlanEnergyScheduleId ===
          powerPlanEnergyScheduleId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.find(
        (powerPlanEnergySchedule) =>
          powerPlanEnergySchedule.powerPlanEnergyScheduleId ===
          powerPlanEnergyScheduleId2
      )
    ).to.be.undefined;
  });

  it('should be able to query PowerPlanEnergySchedules as BSP for which I have permission', async () => {
    const query = '?edpRegisteredResourceMrid=edpRegisteredResourceMrid';
    const response = await axios.get(
      `${Environment.baseUrlBSP}/api/powerPlanEnergySchedule${query}`,
      {
        headers: {'x-access-token': tokenBSP1}
      }
    );
    const queryResponse: PowerPlanEnergySchedule[] = response.data;

    expect(response.status).equal(200);
    expect(
      queryResponse.find(
        (powerPlanEnergySchedule) =>
          powerPlanEnergySchedule.powerPlanEnergyScheduleId ===
          powerPlanEnergyScheduleId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.find(
        (powerPlanEnergySchedule) =>
          powerPlanEnergySchedule.powerPlanEnergyScheduleId ===
          powerPlanEnergyScheduleId2
      )
    ).to.be.undefined;
  });

  it('should not be able to get results from querying PowerPlanEnergySchedules as a Producer', async () => {
    const query = '?edpRegisteredResourceMrid=edpRegisteredResourceMrid';
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/powerPlanEnergySchedule${query}`,
      {
        headers: {'x-access-token': tokenPRODUCER1}
      }
    );
    const queryResponse: PowerPlanEnergySchedule[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).equals(0);
  });
});
