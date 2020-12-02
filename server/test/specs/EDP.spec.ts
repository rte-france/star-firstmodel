/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import {EDP} from '../../src/models/EDP';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {loginHelper} from '../helpers/Login.helper';
import {Environment} from '../../config/Environment';
import {EDPHelper} from '../helpers/EDP.helper';
import {SiteHelper} from '../helpers/Site.helper';
import {Site} from '../../src/models/Site';
import {SiteType} from '../enums/SiteType';
import {EDA} from '../../src/models/EDA';
import {EDAHelper} from '../helpers/EDA.helper';

let edpRegisteredResourceId: string;
let edpRegisteredResourceId2: string;
let siteId2: string;
let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenDSO2: string;
let tokenPRODUCER1: string;

const mockEDA: EDA = new EDAHelper().createEda('BSP1', '7Y778300000I');
const mockEDA2: EDA = new EDAHelper().createEda('BSP2', '7Y778300000I');
const mockEDP: EDP = new EDPHelper().createEdp('edpRegisteredResourceMrid');
const mockEDP2: EDP = new EDPHelper().createEdp('edpRegisteredResourceMrid');
const mockEDPUpdate: EDP = new EDPHelper().createEdp(
  'edpRegisteredResourceMrid'
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

describe('EDP REST test', () => {
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

  it('should be able to create an EDP as TSO1', async () => {
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
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/edp/`,
      mockEDP,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdEDP: EDP = response.data;
    edpRegisteredResourceId = createdEDP.edpRegisteredResourceId;

    expect(response.status).equal(201);
    expect(createdEDP.edpRegisteredResourceMrid).equal(
      mockEDP.edpRegisteredResourceMrid
    );
    expect(createdEDP.edpRegisteredResourceName).equal(
      mockEDP.edpRegisteredResourceName
    );
    expect(createdEDP.siteId).equal(mockEDP.siteId);
  });

  it('should not be able to create an EDP as DSO1', async () => {
    try {
      await axios.post(`${Environment.baseUrlDSO}/api/edp/`, mockEDP, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create an EDP.'
      );
    }
  });

  it('should not be able to create an EDP as BSP', async () => {
    try {
      await axios.post(`${Environment.baseUrlBSP}/api/edp/`, mockEDP, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create an EDP.'
      );
    }
  });

  it('should not be able to create an EDP as PRODUCER', async () => {
    try {
      await axios.post(`${Environment.baseUrlPRODUCER}/api/edp/`, mockEDP, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create an EDP.'
      );
    }
  });

  it('should not be able to get an EDP when the ID does not exist', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/edp/NONEXISTINGID`, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'NONEXISTINGID does not exist.'
      );
    }
  });

  it('should be able to get an EDP by id as DSO1 when I have the permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/edp/${edpRegisteredResourceId}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.data.edpRegisteredResourceId).equal(
      edpRegisteredResourceId
    );
  });

  it('should be able to get an EDP by id as BSP when I have the permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/edp/${edpRegisteredResourceId}`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.data.edpRegisteredResourceId).equal(
      edpRegisteredResourceId
    );
  });

  it('should be able to get an EDP by id as PRODUCER when I have the permission', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/edp/${edpRegisteredResourceId}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.data.edpRegisteredResourceId).equal(
      edpRegisteredResourceId
    );
  });

  it('should be able to create a second EDP as TSO1', async () => {
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
    siteId2 = createSiteResponse.data.siteId;
    mockEDP2.siteId = createSiteResponse.data.siteId;
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/edp/`,
      mockEDP2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdEDP: EDP = response.data;
    edpRegisteredResourceId2 = createdEDP.edpRegisteredResourceId;

    expect(response.status).equal(201);
    expect(createdEDP.edpRegisteredResourceMrid).equal(
      mockEDP2.edpRegisteredResourceMrid
    );
    expect(createdEDP.edpRegisteredResourceName).equal(
      mockEDP2.edpRegisteredResourceName
    );
    expect(createdEDP.siteId).equal(mockEDP2.siteId);
  });

  it('should not be able to get an EDP by id as DSO1 when I do not have the permission', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlDSO}/api/edp/${edpRegisteredResourceId2}`,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get this EDP.'
      );
    }
  });

  it('should not be able to get an EDP by id as BSP when I do not have the permission', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlBSP}/api/edp/${edpRegisteredResourceId2}`,
        {headers: {'x-access-token': tokenBSP1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get this EDP.'
      );
    }
  });

  it('should not be able to get an EDP by id as PRODUCER when I do not have the permission', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlPRODUCER}/api/edp/${edpRegisteredResourceId2}`,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to get this EDP.'
      );
    }
  });

  it('should not be able to get an EDP with invalid query parameters as TSO1', async () => {
    const query = '?siteId=67859430';
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/edp${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: EDP[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).equal(0);
  });

  it('should be able to query EDPs as DSO1 when I have the permission', async () => {
    const query = '?edpRegisteredResourceMrid=edpRegisteredResourceMrid';
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/edp${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const queryResponse: EDP[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find(
        (edp) => edp.edpRegisteredResourceId === edpRegisteredResourceId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.find(
        (edp) => edp.edpRegisteredResourceId === edpRegisteredResourceId2
      )
    ).to.be.undefined;
  });

  it('should be able to query EDPs as BSP when I have the permission', async () => {
    const query = '?edpRegisteredResourceMrid=edpRegisteredResourceMrid';
    const response = await axios.get(
      `${Environment.baseUrlBSP}/api/edp${query}`,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const queryResponse: EDP[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find(
        (edp) => edp.edpRegisteredResourceId === edpRegisteredResourceId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.find(
        (edp) => edp.edpRegisteredResourceId === edpRegisteredResourceId2
      )
    ).to.be.undefined;
  });

  it('should be able to query EDPs as PRODUCER when I have the permission', async () => {
    const query = '?edpRegisteredResourceMrid=edpRegisteredResourceMrid';
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/edp${query}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    const queryResponse: EDP[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(
      queryResponse.find(
        (edp) => edp.edpRegisteredResourceId === edpRegisteredResourceId
      )
    ).to.not.be.undefined;
    expect(
      queryResponse.find(
        (edp) => edp.edpRegisteredResourceId === edpRegisteredResourceId2
      )
    ).to.be.undefined;
  });

  it('should be able to update EDP as DSO1 when I have the permission', async () => {
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

    const updateEDP: EDP = mockEDPUpdate;
    updateEDP.edpRegisteredResourceId =
      createEDPResponse.data.edpRegisteredResourceId;
    updateEDP.siteId = createSiteResponse.data.siteId;

    const queryResponse = await axios.put(
      `${Environment.baseUrlDSO}/api/edp/`,
      updateEDP,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.data.edpRegisteredResourceId).equal(
      createEDPResponse.data.edpRegisteredResourceId
    );
  });

  it('should be able to update EDP as BSP when I have the permission', async () => {
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

    const updateEDP: EDP = mockEDPUpdate;
    updateEDP.edpRegisteredResourceId =
      createEDPResponse.data.edpRegisteredResourceId;
    updateEDP.siteId = createSiteResponse.data.siteId;

    const queryResponse = await axios.put(
      `${Environment.baseUrlBSP}/api/edp/`,
      updateEDP,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.data.edpRegisteredResourceId).equal(
      createEDPResponse.data.edpRegisteredResourceId
    );
  });

  it('should be able to update EDP as PRODUCER when I have the permission', async () => {
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

    const updateEDP: EDP = mockEDPUpdate;
    updateEDP.edpRegisteredResourceId =
      createEDPResponse.data.edpRegisteredResourceId;
    updateEDP.siteId = createSiteResponse.data.siteId;

    const queryResponse = await axios.put(
      `${Environment.baseUrlPRODUCER}/api/edp/`,
      updateEDP,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.data.edpRegisteredResourceId).equal(
      createEDPResponse.data.edpRegisteredResourceId
    );
  });

  it('should not be able to update EDP as DSO1 when I do not have the permission', async () => {
    const updateEDP: EDP = mockEDPUpdate;
    updateEDP.edpRegisteredResourceId = edpRegisteredResourceId2;
    updateEDP.siteId = siteId2;

    try {
      await axios.put(`${Environment.baseUrlDSO}/api/edp/`, updateEDP, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to update EDP.'
      );
    }
  });

  it('should be able to update EDP as BSP when I have the permission', async () => {
    const updateEDP: EDP = mockEDPUpdate;
    updateEDP.edpRegisteredResourceId = edpRegisteredResourceId2;
    updateEDP.siteId = siteId2;

    try {
      await axios.put(`${Environment.baseUrlBSP}/api/edp/`, updateEDP, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to update EDP.'
      );
    }
  });

  it('should be able to update EDP as PRODUCER when I have the permission', async () => {
    const updateEDP: EDP = mockEDPUpdate;
    updateEDP.edpRegisteredResourceId = edpRegisteredResourceId2;
    updateEDP.siteId = siteId2;

    try {
      await axios.put(`${Environment.baseUrlPRODUCER}/api/edp/`, updateEDP, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'Organization does not have permission to update EDP.'
      );
    }
  });
});
