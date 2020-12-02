/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {MockStub} from '@theledger/fabric-mock-stub';
import {InvokeResponse} from './InvokeResponse';
import {QueryResponse} from './QueryResponse';
import {ChaincodeResponse} from 'fabric-shim';

export const mockInvoke = async (
  mockStub: MockStub,
  args: string[],
  isErrorExpected: boolean
): Promise<InvokeResponse> => {
  return isErrorExpected
    ? mockStub.mockInvoke('txId', args)
    : catchError(await mockStub.mockInvoke(args[2], args));
};

export const mockQuery = async <Type>(
  mockStub: MockStub,
  args: string[],
  isErrorExpected: boolean
): Promise<QueryResponse<Type>> => {
  const response = isErrorExpected
    ? await mockStub.mockInvoke('txId', args)
    : catchError(await mockStub.mockInvoke('txId', args));

  return parseChaincodeResponse<Type>(response);
};

const catchError = (
  response: InvokeResponse | QueryResponse<any>
): InvokeResponse | QueryResponse<any> => {
  if (response.status === 500) {
    throw new Error(response.message);
  }

  return response;
};

const parseChaincodeResponse = <Type>(
  chaincodeResponse: ChaincodeResponse
): QueryResponse<Type> => {
  return {
    message: chaincodeResponse.message,
    status: chaincodeResponse.status,
    payload: chaincodeResponse.payload.length
      ? JSON.parse(chaincodeResponse.payload.toString())
      : undefined
  };
};
