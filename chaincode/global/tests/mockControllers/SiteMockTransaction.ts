/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {InvokeResponse} from '../common/InvokeResponse';
import {mockInvoke, mockQuery} from '../common/MockTransaction';
import {ChaincodeMockStub} from '@theledger/fabric-mock-stub';
import {Site} from '../../src/site/Site';
import {IOrganization} from '../../interfaces/IOrganization';
import {QueryResponse} from '../common/QueryResponse';
import {EDP} from '../../src/edp/EDP';

export class SiteMockTransaction {
  public constructor(private readonly mockStub: ChaincodeMockStub) {}

  public async createSite(
    site: Site,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['Site.createSite', JSON.stringify([site]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async updateSite(
    site: Site,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<InvokeResponse> {
    return mockInvoke(
      this.mockStub,
      ['Site.updateSite', JSON.stringify([site]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async getSiteById(
    siteId: string,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<Site>> {
    return mockQuery<Site>(
      this.mockStub,
      [
        'Site.getSiteById',
        JSON.stringify([siteId]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async getAllSites(
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<Site[]>> {
    return mockQuery<Site[]>(
      this.mockStub,
      ['Site.getAllSites', JSON.stringify([]), JSON.stringify(organization)],
      isErrorExpected
    );
  }

  public async querySite(
    siteQuery: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<Site[]>> {
    return mockQuery<Site[]>(
      this.mockStub,
      [
        'Site.querySite',
        JSON.stringify([siteQuery]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }

  public async queryEDPBysiteId(
    siteQuery: any,
    organization: IOrganization,
    isErrorExpected = false
  ): Promise<QueryResponse<EDP[]>> {
    return mockQuery<EDP[]>(
      this.mockStub,
      [
        'EDP.queryEDP',
        JSON.stringify([siteQuery]),
        JSON.stringify(organization)
      ],
      isErrorExpected
    );
  }
}
