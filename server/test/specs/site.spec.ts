/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import * as fs from 'fs';
import * as FormData from 'form-data';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {Site} from '../../src/models/Site';
import {loginHelper} from '../helpers/Login.helper';
import {Environment} from '../../config/Environment';
import {EDA} from '../../src/models/EDA';
import {EDAHelper} from '../helpers/EDA.helper';
import {SiteHelper} from '../helpers/Site.helper';
import {SiteType} from '../enums/SiteType';

let siteId: string;
let siteIdHV: string;
let siteId2: string;
let edaRegisteredResourceId: string;
let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenDSO2: string;
let tokenPRODUCER1: string;

const mockEDA: EDA = new EDAHelper().createEda('BSP1', '7Y778300000I');
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
const mockMVSiteUpdate: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO2',
  SiteType.MV,
  'PRM00000000234766',
  'EolienMistral'
);
const mockMVSiteUpdate2: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO1',
  SiteType.MV,
  'PRM00000000234766',
  'EolienAlize'
);
const mockHVSite: Site = new SiteHelper().createSite(
  ['automate100'],
  'DSO1',
  SiteType.HV,
  'PRM00000000234766',
  'EolienMistral'
);
const mockHVSiteUpdate: Site = new SiteHelper().createSite(
  ['nazaRegisteredResourceMrid'],
  'DSO1',
  SiteType.HV,
  'PRM00000000234766',
  'EolienMistral'
);

describe('Site REST test', () => {
  jest.setTimeout(TimeoutDuration.fiftySeconds.valueOf());

  beforeAll(async () => {
    tokenTSO1 = await loginHelper(Environment.baseUrlTSO, 'user.star@tso1.com');
    tokenDSO1 = await loginHelper(Environment.baseUrlDSO, 'user.star@dso1.com');
    tokenDSO2 = await loginHelper(
      Environment.baseUrlDSO,
      'user.star@dso2.com'
    );
    tokenBSP1 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp1.com');
    tokenPRODUCER1 = await loginHelper(
      Environment.baseUrlPRODUCER,
      'user.star@eolien-mistral.com'
    );
  });

  it('should be able to create a site with HV type as TSO1', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    mockHVSite.edaRegisteredResourceId =
      createEDAResponse.data.edaRegisteredResourceId;
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/site/`,
      mockHVSite,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdSite: Site = response.data;
    siteIdHV = createdSite.siteId;

    expect(response.status).equal(201);
    expect(createdSite.edaRegisteredResourceId).equal(
      mockHVSite.edaRegisteredResourceId
    );
    expect(createdSite.nazaRegisteredResourceMrid[0]).equal(
      mockHVSite.nazaRegisteredResourceMrid[0]
    );
    expect(createdSite.a04RegisteredResourceMrid).equal(
      mockHVSite.a04RegisteredResourceMrid
    );
    expect(createdSite.voltageType).equal(mockHVSite.voltageType);
    expect(createdSite.objectAggregationMeteringPoint).equal(
      mockHVSite.objectAggregationMeteringPoint
    );
    expect(createdSite.siteName).equal(mockHVSite.siteName);
    expect(createdSite.siteSIRET).equal(mockHVSite.siteSIRET);
    expect(createdSite.siteLocation).equal(mockHVSite.siteLocation);
    expect(createdSite.a04Name).equal(mockHVSite.a04Name);
    expect(createdSite.siteType).equal(mockHVSite.siteType);
    expect(createdSite.siteIEC).equal(mockHVSite.siteIEC);
    expect(createdSite.producerName).equal(mockHVSite.producerName);
  });

  it('should not be able to create a site with MV type as TSO1', async () => {
    try {
      await axios.post(`${Environment.baseUrlTSO}/api/site/`, mockMVSite, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a site for MV type.'
      );
    }
  });

  it('should be able to create a site with MV type as DSO1 when my organization has the permission', async () => {
    const createEDAResponse = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdEDA: EDA = createEDAResponse.data;
    edaRegisteredResourceId = createdEDA.edaRegisteredResourceId;
    mockMVSite.edaRegisteredResourceId = edaRegisteredResourceId;
    const response = await axios.post(
      `${Environment.baseUrlDSO}/api/site/`,
      mockMVSite,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const createdSite: Site = response.data;
    siteId = response.data.siteId;

    expect(response.status).equal(201);
    expect(createdSite.edaRegisteredResourceId).equal(
      mockMVSite.edaRegisteredResourceId
    );
    expect(createdSite.nazaRegisteredResourceMrid[0]).equal(
      mockMVSite.nazaRegisteredResourceMrid[0]
    );
    expect(createdSite.a04RegisteredResourceMrid).equal(
      mockMVSite.a04RegisteredResourceMrid
    );
    expect(createdSite.voltageType).equal(mockMVSite.voltageType);
    expect(createdSite.objectAggregationMeteringPoint).equal(
      mockMVSite.objectAggregationMeteringPoint
    );
    expect(createdSite.siteName).equal(mockMVSite.siteName);
    expect(createdSite.siteSIRET).equal(mockMVSite.siteSIRET);
    expect(createdSite.siteLocation).equal(mockMVSite.siteLocation);
    expect(createdSite.a04Name).equal(mockMVSite.a04Name);
    expect(createdSite.siteType).equal(mockMVSite.siteType);
    expect(createdSite.siteIEC).equal(mockMVSite.siteIEC);
    expect(createdSite.producerName).equal(mockMVSite.producerName);
  });

  it('should not be able to create a site with MV type as DSO1 when the organization does not have permission', async () => {
    try {
      await axios.post(`${Environment.baseUrlDSO}/api/site/`, mockMVSite2, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization does not have the permission to create Site.`
      );
    }
  });

  it('should not be able to create a site with HV type as DSO1', async () => {
    try {
      await axios.post(`${Environment.baseUrlDSO}/api/site/`, mockHVSite, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a site for HV type.'
      );
    }
  });

  it('should not be able to create an MV site as BSP', async () => {
    try {
      await axios.post(`${Environment.baseUrlBSP}/api/site/`, mockMVSite, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a site.'
      );
    }
  });

  it('should not be able to create an HV site as BSP', async () => {
    try {
      await axios.post(`${Environment.baseUrlBSP}/api/site/`, mockHVSite, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a site.'
      );
    }
  });

  it('should not be able to create an MV site as PRODUCER', async () => {
    try {
      await axios.post(`${Environment.baseUrlPRODUCER}/api/site/`, mockMVSite, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a site.'
      );
    }
  });

  it('should not be able to create an HV site as PRODUCER', async () => {
    try {
      await axios.post(`${Environment.baseUrlPRODUCER}/api/site/`, mockHVSite, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create a site.'
      );
    }
  });

  it('should be able to upload a csv with sites', async () => {
    const filePath: string = `${process.cwd()}/test/mock-data/SITE.example.csv`;
    const amountOfSitesInCSV: number = 4;
    const form = new FormData();
    form.append('csv', fs.readFileSync(filePath, 'utf-8'), 'XX');

    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/site/csv-upload`,
      form,
      {headers: {'x-access-token': tokenTSO1, ...form.getHeaders()}}
    );

    expect(response.status).equal(201);
    expect(response.data.length).equal(amountOfSitesInCSV);
  });

  it('should be able to get a site by query parameters as TSO1', async () => {
    const query = `?nazaRegisteredResourceMrid=${mockHVSite.nazaRegisteredResourceMrid}`;

    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/site${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: Site = response.data[0];

    expect(response.status).equal(200);
    expect(queryResponse.nazaRegisteredResourceMrid).to.include(
      mockHVSite.nazaRegisteredResourceMrid[0]
    );
  });

  it('should not be able to get a site with a non existing query parameter', async () => {
    const query = `?nazaRegisteredResourceMrid=IDONOTEXIST`;

    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/site${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );

    expect(response.status).equal(200);
    expect(response.data.length).equal(0);
  });

  it('should be able to get a site by Id for which I have permission as DSO1', async () => {
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/site/${siteId}`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const queryResponse: Site = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.siteId).equal(siteId);
  });

  it('should be able to get an MV site by Id for which I have permission as BSP', async () => {
    const response = await axios.get(
      `${Environment.baseUrlBSP}/api/site/${siteId}`,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const queryResponse: Site = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.siteId).equal(siteId);
  });

  it('should be able to get a site by Id for which I have permission as BSP', async () => {
    const response = await axios.get(
      `${Environment.baseUrlBSP}/api/site/${siteIdHV}`,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const queryResponse: Site = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.siteId).equal(siteIdHV);
  });

  it('should be able to get an MV site by Id for which I have permission as PRODUCER', async () => {
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/site/${siteId}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    const queryResponse: Site = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.siteId).equal(siteId);
  });

  it('should be able to get an HV site by Id for which I have permission as PRODUCER', async () => {
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/site/${siteIdHV}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    const queryResponse: Site = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.siteId).equal(siteIdHV);
  });

  it('should be able to get a site by query parameters for which I have permission as DSO1', async () => {
    const query = `?nazaRegisteredResourceMrid=${mockHVSite.nazaRegisteredResourceMrid}`;
    const response = await axios.get(
      `${Environment.baseUrlDSO}/api/site${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const queryResponse: Site[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(queryResponse.find((site) => site.siteId === siteId2)).to.be
      .undefined;
  });

  it('should be able to get a site by query parameters for which I have permission as BSP', async () => {
    const query = `?nazaRegisteredResourceMrid=${mockHVSite.nazaRegisteredResourceMrid}`;
    const response = await axios.get(
      `${Environment.baseUrlBSP}/api/site${query}`,
      {headers: {'x-access-token': tokenBSP1}}
    );
    const queryResponse: Site[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(queryResponse.find((site) => site.siteId === siteIdHV).siteId).equal(
      siteIdHV
    );
  });

  it('should be able to get a site by query parameters for which I have permission as PRODUCER', async () => {
    const query = `?nazaRegisteredResourceMrid=${mockHVSite.nazaRegisteredResourceMrid}`;
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/site${query}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    const queryResponse: Site[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(queryResponse.find((site) => site.siteId === siteIdHV).siteId).equal(
      siteIdHV
    );
  });

  it('should be able to get all sites for which I have permission as DSO1', async () => {
    const response = await axios.get(`${Environment.baseUrlDSO}/api/site/all`, {
      headers: {'x-access-token': tokenDSO1}
    });
    const queryResponse: Site[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(queryResponse.find((site) => site.siteId === siteId2)).to.be
      .undefined;
  });

  it('should be able to get all sites for which I have permission as BSP', async () => {
    const response = await axios.get(`${Environment.baseUrlBSP}/api/site/all`, {
      headers: {'x-access-token': tokenBSP1}
    });
    const queryResponse: Site[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(queryResponse.find((site) => site.siteId === siteIdHV).siteId).equal(
      siteIdHV
    );
  });

  it('should be able to get all sites for which I have permission as PRODUCER', async () => {
    const response = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/site/all`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );
    const queryResponse: Site[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).greaterThan(0);
    expect(queryResponse.find((site) => site.siteId === siteIdHV).siteId).equal(
      siteIdHV
    );
  });

  it('should not be able to update a site as BSP', async () => {
    try {
      await axios.put(
        `${Environment.baseUrlBSP}/api/site/${siteId}`,
        mockHVSiteUpdate,
        {headers: {'x-access-token': tokenBSP1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to update Site.'
      );
    }
  });

  it('should not be able to update a site as PRODUCER', async () => {
    try {
      await axios.put(
        `${Environment.baseUrlPRODUCER}/api/site/${siteId}`,
        mockHVSiteUpdate,
        {headers: {'x-access-token': tokenPRODUCER1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to update Site.'
      );
    }
  });

  it('should not be able to get a site when the site id does not exist', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/site/NONEXISTINGID`, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should be able to update a site with type HV as TSO1.', async () => {
    const response = await axios.put(
      `${Environment.baseUrlTSO}/api/site/${siteId}`,
      mockHVSiteUpdate,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const updatedSite: Site = response.data;

    expect(response.status).equal(200);
    expect(updatedSite.edaRegisteredResourceId).equal(
      mockHVSiteUpdate.edaRegisteredResourceId
    );
    expect(updatedSite.nazaRegisteredResourceMrid[0]).equal(
      mockHVSiteUpdate.nazaRegisteredResourceMrid[0]
    );
    expect(updatedSite.a04RegisteredResourceMrid).equal(
      mockHVSiteUpdate.a04RegisteredResourceMrid
    );
    expect(updatedSite.voltageType).equal(mockHVSiteUpdate.voltageType);
    expect(updatedSite.objectAggregationMeteringPoint).equal(
      mockHVSiteUpdate.objectAggregationMeteringPoint
    );
    expect(updatedSite.siteName).equal(mockHVSiteUpdate.siteName);
    expect(updatedSite.siteSIRET).equal(mockHVSiteUpdate.siteSIRET);
    expect(updatedSite.siteLocation).equal(mockHVSiteUpdate.siteLocation);
    expect(updatedSite.a04Name).equal(mockHVSiteUpdate.a04Name);
    expect(updatedSite.siteType).equal(mockHVSiteUpdate.siteType);
    expect(updatedSite.siteIEC).equal(mockHVSiteUpdate.siteIEC);
    expect(updatedSite.producerName).equal(mockHVSiteUpdate.producerName);
  });

  it('should not be able to update a site with type MV as TSO1.', async () => {
    try {
      await axios.put(
        `${Environment.baseUrlTSO}/api/site/${siteId}`,
        mockMVSiteUpdate,
        {headers: {'x-access-token': tokenTSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to update a site for MV type.'
      );
    }
  });

  it('should be able to update a site with type MV as DSO1 when my organization has the permission.', async () => {
    mockMVSiteUpdate2.siteId = siteId;
    mockMVSiteUpdate2.edaRegisteredResourceId = edaRegisteredResourceId;

    const response = await axios.put(
      `${Environment.baseUrlDSO}/api/site/${siteId}`,
      mockMVSiteUpdate2,
      {headers: {'x-access-token': tokenDSO1}}
    );
    const updatedSite: Site = response.data;

    expect(response.status).equal(200);
    expect(updatedSite.edaRegisteredResourceId).equal(
      mockMVSiteUpdate2.edaRegisteredResourceId
    );
    expect(updatedSite.nazaRegisteredResourceMrid[0]).equal(
      mockMVSiteUpdate2.nazaRegisteredResourceMrid[0]
    );
    expect(updatedSite.a04RegisteredResourceMrid).equal(
      mockMVSiteUpdate2.a04RegisteredResourceMrid
    );
    expect(updatedSite.voltageType).equal(mockMVSiteUpdate2.voltageType);
    expect(updatedSite.objectAggregationMeteringPoint).equal(
      mockMVSiteUpdate2.objectAggregationMeteringPoint
    );
    expect(updatedSite.siteName).equal(mockMVSiteUpdate2.siteName);
    expect(updatedSite.siteSIRET).equal(mockMVSiteUpdate2.siteSIRET);
    expect(updatedSite.siteLocation).equal(mockMVSiteUpdate2.siteLocation);
    expect(updatedSite.a04Name).equal(mockMVSiteUpdate2.a04Name);
    expect(updatedSite.siteType).equal(mockMVSiteUpdate2.siteType);
    expect(updatedSite.siteIEC).equal(mockMVSiteUpdate2.siteIEC);
    expect(updatedSite.producerName).equal(mockMVSiteUpdate2.producerName);
  });

  it('should not be able to update a site with type HV as DSO1.', async () => {
    try {
      await axios.put(
        `${Environment.baseUrlDSO}/api/site/${siteId}`,
        mockHVSiteUpdate,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to update a site for HV type.'
      );
    }
  });

  it('should not be able to update a site with type MV as DSO1 when my organization does not have the permission.', async () => {
    const invokeResponse = await axios.post(
      `${Environment.baseUrlDSO}/api/site/`,
      mockMVSite2,
      {headers: {'x-access-token': tokenDSO2}}
    );
    siteId2 = invokeResponse.data.siteId;

    try {
      await axios.put(
        `${Environment.baseUrlDSO}/api/site/${siteId2}`,
        mockMVSite2,
        {headers: {'x-access-token': tokenDSO1}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization does not have the permission to update Site.`
      );
    }
  });
});
