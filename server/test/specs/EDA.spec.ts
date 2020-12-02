/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import {EDA} from '../../src/models/EDA';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {loginHelper} from '../helpers/Login.helper';
import {Environment} from '../../config/Environment';
import {Site} from '../../src/models/Site';
import {EDAHelper} from '../helpers/EDA.helper';
import {SiteHelper} from '../helpers/Site.helper';
import {SiteType} from '../enums/SiteType';

let ID: string;
let secondID: string;
let thirdID: string;
let tokenTSO1: string;
let tokenDSO1: string;
let tokenBSP1: string;
let tokenPRODUCER1: string;

const mockEDA: EDA = new EDAHelper().createEda('BSP1', '7Y778300000I');
const mockEDA2: EDA = new EDAHelper().createEda('BSP2', '7Y778300000I');
const mockEDA3: EDA = new EDAHelper().createEda('ID_BSP2', '7Y778300000I');

const mockHVSite: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO1',
  SiteType.HV,
  'PRM00000000234766',
  'EolienMistral'
);
const mockHVSite2: Site = new SiteHelper().createSite(
  ['automate1'],
  'DSO2',
  SiteType.HV,
  'PRM00000000234766',
  'EolienAlize'
);

describe('EDA REST test', () => {
  jest.setTimeout(TimeoutDuration.fiftySeconds.valueOf());

  beforeAll(async () => {
    tokenTSO1 = await loginHelper(Environment.baseUrlTSO, 'user.star@tso1.com');
    tokenDSO1 = await loginHelper(Environment.baseUrlDSO, 'user.star@dso1.com');
    tokenBSP1 = await loginHelper(Environment.baseUrlBSP, 'user.star@bsp1.com');
    tokenPRODUCER1 = await loginHelper(
      Environment.baseUrlPRODUCER,
      'user.star@eolien-mistral.com'
    );
  });

  it('should be able to create an EDA as TSO1', async () => {
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdEDA: EDA = response.data;
    ID = createdEDA.edaRegisteredResourceId;

    expect(response.status).equal(201);
    expect(createdEDA.a46Name).equal(mockEDA.a46Name);
    expect(createdEDA.edaRegisteredResourceName).equal(
      mockEDA.edaRegisteredResourceName
    );
    expect(createdEDA.edaRegisteredResourceMrid).equal(
      mockEDA.edaRegisteredResourceMrid
    );
  });

  it('should not be able to create an EDA as DSO1', async () => {
    try {
      await axios.post(`${Environment.baseUrlDSO}/api/eda/`, mockEDA, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create an EDA.'
      );
    }
  });

  it('should not be able to create an EDA as BSP', async () => {
    try {
      await axios.post(`${Environment.baseUrlBSP}/api/eda/`, mockEDA, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create an EDA.'
      );
    }
  });

  it('should not be able to create an EDA as PRODUCER', async () => {
    try {
      await axios.post(`${Environment.baseUrlPRODUCER}/api/eda/`, mockEDA, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'OrganizationType is not allowed to create an EDA.'
      );
    }
  });

  it('should be able to get an EDA by ID when my organization has the permission to get the EDA as DSO1.', async () => {
    const site: Site = mockHVSite;
    site.edaRegisteredResourceId = ID;
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, site, {
      headers: {'x-access-token': tokenTSO1}
    });

    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/eda/${ID}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.edaRegisteredResourceId).equal(ID);
  });

  it('should not be able to get an EDA by ID as a PRODUCER.', async () => {
    const site: Site = mockHVSite;
    site.edaRegisteredResourceId = ID;
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, site, {
      headers: {'x-access-token': tokenTSO1}
    });

    try {
      await axios.get(`${Environment.baseUrlPRODUCER}/api/eda/${ID}`, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `OrganizationType is not allowed to get ${ID}`
      );
    }
  });

  it('should not be able to get an EDA as DSO1 for which I do not have the permissions.', async () => {
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA3,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const site: Site = mockHVSite2;
    thirdID = response.data.edaRegisteredResourceId;
    site.edaRegisteredResourceId = thirdID;
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, site, {
      headers: {'x-access-token': tokenTSO1}
    });

    try {
      await axios.get(`${Environment.baseUrlDSO}/api/eda/${thirdID}`, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `DSO organization has no permission to get ${thirdID}`
      );
    }
  });

  it('should not be able to get an EDA when the ID does not exist', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/eda/NONEXISTINGID`, {
        headers: {'x-access-token': tokenTSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        'does not exist.'
      );
    }
  });

  it('should be able to create another eda as TSO1', async () => {
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA2,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const createdEDA: EDA = response.data;

    expect(response.status).equal(201);
    expect(createdEDA.a46Name).equal(mockEDA2.a46Name);
    expect(createdEDA.edaRegisteredResourceName).equal(
      mockEDA2.edaRegisteredResourceName
    );
    expect(createdEDA.edaRegisteredResourceMrid).equal(
      mockEDA2.edaRegisteredResourceMrid
    );
  });

  it('should be able to get all EDAs that are related to my organization as DSO1.', async () => {
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/eda/`,
      mockEDA,
      {headers: {'x-access-token': tokenTSO1}}
    );
    secondID = response.data.edaRegisteredResourceId;

    const site: Site = mockHVSite;
    site.edaRegisteredResourceId = secondID;
    await axios.post(`${Environment.baseUrlTSO}/api/site/`, site, {
      headers: {'x-access-token': tokenTSO1}
    });

    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/eda/all`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).greaterThan(0);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === ID
      ).edaRegisteredResourceId
    ).equal(ID);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === secondID
      ).edaRegisteredResourceId
    ).equal(secondID);
  });

  it('should be able to get all EDAs that are related to my organization as BSP.', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/eda/all`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).greaterThan(0);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === ID
      ).edaRegisteredResourceId
    ).equal(ID);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === secondID
      ).edaRegisteredResourceId
    ).equal(secondID);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === thirdID
      )
    ).to.be.undefined;
  });

  it('should not be able to get all EDAs as a PRODUCER.', async () => {
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/eda/all`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).equal(0);
  });

  it('should not be able to get an EDA with invalid query parameters', async () => {
    const query = '?a46Name=2019';
    const response = await axios.get(
      `${Environment.baseUrlTSO}/api/eda${query}`,
      {headers: {'x-access-token': tokenTSO1}}
    );
    const queryResponse: EDA[] = response.data;

    expect(response.status).equal(200);
    expect(queryResponse.length).equal(0);
  });

  it('should be able to query EDAs that are related to my organization as DSO1.', async () => {
    const query = '?edaRegisteredResourceMrid=7Y778300000I';
    const queryResponse = await axios.get(
      `${Environment.baseUrlDSO}/api/eda/${query}`,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === ID
      ).edaRegisteredResourceId
    ).equal(ID);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === secondID
      ).edaRegisteredResourceId
    ).equal(secondID);
  });

  it('should be able to query EDAs that are related to my organization as BSP.', async () => {
    const query = '?edaRegisteredResourceMrid=7Y778300000I';
    const queryResponse = await axios.get(
      `${Environment.baseUrlBSP}/api/eda/${query}`,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === ID
      ).edaRegisteredResourceId
    ).equal(ID);
    expect(
      queryResponse.data.find(
        (queriedEDA) => queriedEDA.edaRegisteredResourceId === thirdID
      )
    ).to.be.undefined;
  });

  it('should not be able to query EDAs as PRODUCER.', async () => {
    const query = '?edaRegisteredResourceMrid=7Y778300000I';
    const queryResponse = await axios.get(
      `${Environment.baseUrlPRODUCER}/api/eda/${query}`,
      {headers: {'x-access-token': tokenPRODUCER1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.length).equals(0);
  });

  it('should be able to update EDA that my organization has permission to as DSO1.', async () => {
    const updateEDA: EDA = mockEDA;
    updateEDA.edaRegisteredResourceId = ID;
    updateEDA.edaRegisteredResourceMrid = 'testCode';

    const queryResponse = await axios.put(
      `${Environment.baseUrlDSO}/api/eda/`,
      updateEDA,
      {headers: {'x-access-token': tokenDSO1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.edaRegisteredResourceId).equal(
      updateEDA.edaRegisteredResourceId
    );
    expect(queryResponse.data.edaRegisteredResourceMrid).equal('testCode');
  });

  it('should be able to update EDA that my organization has permission to as BSP.', async () => {
    const updateEDA: EDA = mockEDA;
    updateEDA.edaRegisteredResourceId = ID;
    updateEDA.edaRegisteredResourceMrid = 'testCode2';

    const queryResponse = await axios.put(
      `${Environment.baseUrlBSP}/api/eda/`,
      updateEDA,
      {headers: {'x-access-token': tokenBSP1}}
    );

    expect(queryResponse.status).equal(200);
    expect(queryResponse.data.edaRegisteredResourceId).equal(
      updateEDA.edaRegisteredResourceId
    );
    expect(queryResponse.data.edaRegisteredResourceMrid).equal('testCode2');
  });

  it('should not be able to update EDA that my organization does not have permission to as DSO1.', async () => {
    const updateEDA: EDA = mockEDA3;
    updateEDA.edaRegisteredResourceId = thirdID;
    updateEDA.edaRegisteredResourceMrid = 'testCode';

    try {
      await axios.put(`${Environment.baseUrlDSO}/api/eda/`, updateEDA, {
        headers: {'x-access-token': tokenDSO1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization is not allowed to update ${thirdID}`
      );
    }
  });

  it('should not be able to update EDA that my organization does not have permission to as BSP.', async () => {
    const updateEDA: EDA = mockEDA3;
    updateEDA.edaRegisteredResourceId = thirdID;
    updateEDA.edaRegisteredResourceMrid = 'testCode';

    try {
      await axios.put(`${Environment.baseUrlBSP}/api/eda/`, updateEDA, {
        headers: {'x-access-token': tokenBSP1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `Organization is not allowed to update ${thirdID}`
      );
    }
  });

  it('should not be able to update EDA as PRODUCER.', async () => {
    const updateEDA: EDA = mockEDA;
    updateEDA.edaRegisteredResourceId = ID;
    updateEDA.edaRegisteredResourceMrid = 'testCode';

    try {
      await axios.put(`${Environment.baseUrlPRODUCER}/api/eda/`, updateEDA, {
        headers: {'x-access-token': tokenPRODUCER1}
      });
      expect(false).to.be.true;
    } catch (error) {
      expect(error.message).equal('Request failed with status code 500');
      expect(error.response.data.message.toString()).to.contain(
        `OrganizationType is not allowed to update ${ID}`
      );
    }
  });
});
