/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {SiteDto} from './dto/SiteDto';
import {Site} from '../../models/Site';

export interface ISiteService {
  createSite(site: SiteDto): Promise<any>;

  createSitesFromCSV(sites: SiteDto[]): Promise<any>;

  getAllSites(): Promise<Site[]>;

  getSiteById(id: string): Promise<Site>;

  querySite(siteQuery: any): Promise<Site[]>;

  updateSite(site: SiteDto): Promise<any>;
}
