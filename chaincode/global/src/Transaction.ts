/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {OrganizationTypeMsp} from '../enums/OrganizationTypeMsp';

export abstract class Transaction {
  public readonly mspId: string;

  protected constructor(protected stub: ChaincodeStub) {
    this.mspId = this.stub.getCreator().getMspid();
  }

  protected isOrganizationTypeAllowedToCreateAsset(
    organizationTypeMsp: OrganizationTypeMsp
  ): boolean {
    return this.mspId === organizationTypeMsp;
  }

  protected async getAssetById(assetId: string): Promise<any> {
    const resultAsBytes: Buffer = await this.stub.getState(assetId.toString());

    if (!resultAsBytes || !resultAsBytes.toString()) {
      return undefined;
    }

    return JSON.parse(resultAsBytes.toString());
  }

  protected isOrganizationType(organizationType: string): boolean {
    return this.stub.getCreator().getMspid() === organizationType;
  }
}
