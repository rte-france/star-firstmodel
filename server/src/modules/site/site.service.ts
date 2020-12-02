/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {SiteDto} from './dto/SiteDto';
import {ISiteService} from './site.service.interface';
import {SiteChaincodeMethod} from './enum/SiteChaincodeMethod';
import {FabricConnectorService} from '../fabric-connector/fabric-connector.service';
import {Log} from '../../common/utils/logging/Log';
import {Site} from '../../models/Site';
import {ChannelName} from '../../common/enum/ChannelName';
import {TransactionResponse} from '../fabric-connector/models/TransactionResponse';

@Injectable()
export class SiteService implements ISiteService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async createSite(site: SiteDto): Promise<Site> {
    try {
      Log.server.info(
        `[${SiteService.name}] calling chaincode method [${SiteChaincodeMethod.CreateSite}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        SiteChaincodeMethod.CreateSite,
        [site],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${SiteService.name}].${SiteChaincodeMethod.CreateSite} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateSite(site: SiteDto): Promise<Site> {
    try {
      Log.server.info(
        `[${SiteService.name}].${SiteChaincodeMethod.UpdateSite}`
      );

      const response: TransactionResponse = await this.fabricClient.invoke(
        SiteChaincodeMethod.UpdateSite,
        [site],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${SiteService.name}].${SiteChaincodeMethod.UpdateSite} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async createSitesFromCSV(sites: SiteDto[]): Promise<string[]> {
    try {
      const siteIDs: string[] = [];

      for (const site of sites) {
        await this.createSite(Site.postSiteFromJSON(site));

        siteIDs.push(site.siteId);
      }

      return siteIDs;
    } catch (error) {
      Log.server.error(
        `[${SiteService.name}].${SiteChaincodeMethod.CreateSite} while registering sites from CSV failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getAllSites(): Promise<Site[]> {
    try {
      Log.server.info(
        `[${SiteService.name}] calling chaincode method [${SiteChaincodeMethod.QuerySite}]`
      );

      return await this.fabricClient.query(
        SiteChaincodeMethod.GetAllSites,
        [],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${SiteService.name}].${SiteChaincodeMethod.GetAllSites} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getSiteById(id: string): Promise<Site> {
    try {
      Log.server.info(
        `[${SiteService.name}] calling chaincode method [${SiteChaincodeMethod.GetSiteById}]`
      );

      return await this.fabricClient.query(
        SiteChaincodeMethod.GetSiteById,
        [id],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${SiteService.name}].${SiteChaincodeMethod.GetSiteById} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async querySite(siteQuery: any): Promise<Site[]> {
    try {
      Log.server.info(
        `[${SiteService.name}] calling chaincode method [${SiteChaincodeMethod.QuerySite}]`
      );

      return await this.fabricClient.query(
        SiteChaincodeMethod.QuerySite,
        [JSON.stringify(siteQuery)],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${SiteService.name}].${SiteChaincodeMethod.QuerySite} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }
}
