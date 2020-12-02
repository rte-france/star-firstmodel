/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {ChaincodeResponse} from 'fabric-shim';
import {expect} from 'chai';
import {initAndGetMockStub} from '../common/InitChaincode';
import {
  tsoOrganization,
  tsoOrganizationType
} from '../helper/Organization.helper';
import {StatusCode} from '../enums/StatusCode';
import {HVMockTransaction} from '../mockControllers/HVMockTransaction';
import {HVHelper} from '../helper/HVHelper';
import {HV} from '../../src/HV/HV';

let mockStub: ChaincodeMockStub;
const hv: HV = new HVHelper().createHV('id', 'id');

beforeEach(
  async (): Promise<any> => {
    mockStub = await initAndGetMockStub(tsoOrganizationType.mspId);
  }
);

describe('As RTE ', () => {
  it('I should be able to create a new HV.', async () => {
    const invokeResponse: ChaincodeResponse = await new HVMockTransaction(
      mockStub
    ).createHV(hv, tsoOrganization);

    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(invokeResponse.payload.toString()).equals(JSON.stringify(hv));
  });

  it('I should be able to update a comptage HV.', async () => {
    await new HVMockTransaction(mockStub).createHV(hv, tsoOrganization);

    const newResolution = 30001;
    hv.resolution = newResolution;
    const invokeResponse: ChaincodeResponse = await new HVMockTransaction(
      mockStub
    ).updateHV(hv, tsoOrganization);

    const updatedHV: HV = JSON.parse(invokeResponse.payload.toString());
    expect(invokeResponse.status).equal(StatusCode.SUCCESS);
    expect(updatedHV.energyAccountMarketDocumentMrid).equals(
      hv.energyAccountMarketDocumentMrid
    );
    expect(updatedHV.resolution).equals(newResolution);
  });
});
