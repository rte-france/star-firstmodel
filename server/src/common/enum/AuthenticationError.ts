/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export enum AuthenticationError {
  CONFIGURATION_FAILURE = 'Failed to load authentication configuration',
  TOKEN_FAILURE = 'Token verification failed: ',
  INVALID_CREDENTIALS = 'Invalid username or password.'
}

