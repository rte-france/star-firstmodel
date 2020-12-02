/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import axios from 'axios';

export const loginHelper = async (
  baseUrl: string,
  userEmail: string
): Promise<string> => {
  try {
    const loginResponse = await axios.post(
      `${baseUrl}/api/auth/login`,
      {userEmail, password: 'passw0rd'},
      {headers: {'Content-Type': 'application/json'}}
    );

    if (loginResponse) {
      return loginResponse.data.token;
    }
  } catch (error) {
    console.error('Error when logging in', error);
  }
};
