/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';
import {expect} from 'chai';
import * as jwt_decode from 'jwt-decode';
import {TimeoutDuration} from '../enums/timeoutDuration.enum';
import {Environment} from '../../config/Environment';

const ID = 'testID';

describe('Authentication REST test', () => {
  jest.setTimeout(TimeoutDuration.fiftySeconds.valueOf());

  it('should be able to log in with correct credentials', async () => {
    const response = await axios.post(
      `${Environment.baseUrlTSO}/api/auth/login`,
      {userEmail: 'user.star@tso1.com', password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );
    expect(response.status).equal(201);

    const decodedJWT = jwt_decode(response.data.token);

    expect(decodedJWT.user.userEmail).equal('user.star@tso1.com');
    expect(decodedJWT.user.organizationId).equal('TSO1');
    expect(decodedJWT.user.role).equal('admin');
  });

  it('should throw an error when I try to log in with incorrect credentials', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlTSO}/api/auth/login`,
        {userEmail: 'nonExistingUser@tso1.com', password: 'HackerPass22'},
        {headers: {'Content-Type': 'application/json'}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(401);
      expect(error.message).equal('Request failed with status code 401');
    }
  });

  it('should throw an error when I try to log in with incorrect username', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlTSO}/api/auth/login`,
        {userEmail: 'nonExistingUser@tso1.com', password: 'passw0rd'},
        {headers: {'Content-Type': 'application/json'}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(401);
      expect(error.message).equal('Request failed with status code 401');
    }
  });

  it('should throw an error when I try to log in with incorrect password', async () => {
    try {
      await axios.post(
        `${Environment.baseUrlTSO}/api/auth/login`,
        {userEmail: 'user.star@tso1.com', password: 'HackerPass23'},
        {headers: {'Content-Type': 'application/json'}}
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(401);
      expect(error.message).equal('Request failed with status code 401');
    }
  });

  it('should not be able to access the PowerPlanEnergySchedule api without being logged in', async () => {
    try {
      await axios.get(
        `${Environment.baseUrlTSO}/api/powerPlanEnergySchedule/${ID}`
      );
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(500);
    }
  });

  it('should not be able to access the Comptage MV api without being logged in', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/comptage/MV/${ID}`);
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(500);
    }
  });

  it('should not be able to access the Comptage HV api without being logged in', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/comptage/HV/${ID}`);
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(500);
    }
  });

  it('should not be able to access the EDA api without being logged in', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/eda/${ID}`);
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(500);
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should not be able to access the EDP api without being logged in', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/edp/${ID}`);
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(500);
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should not be able to access the Bid api without being logged in', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/bid/${ID}`);
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(500);
      expect(error.message).equal('Request failed with status code 500');
    }
  });

  it('should not be able to access the Order api without being logged in', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/orders/${ID}`);
      expect(false).to.be.true;
    } catch (error) {
      // FIXME return correct error code
      expect(error.response.status).equal(404);
      expect(error.message).equal('Request failed with status code 404');
    }
  });

  it('should not be able to access the Site api without being logged in', async () => {
    try {
      await axios.get(`${Environment.baseUrlTSO}/api/site/${ID}`);
      expect(false).to.be.true;
    } catch (error) {
      expect(error.response.status).equal(500);
      expect(error.message).equal('Request failed with status code 500');
    }
  });
});
