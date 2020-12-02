/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {Site} from './Site';
import {Log} from '../../logger/Log';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {AssetType} from '../../enums/AssetType';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {SiteType} from './enums/SiteType';
import {AssetError} from '../common/AssetError';
import {IOrganization} from '../../interfaces/IOrganization';
import {Transaction} from '../Transaction';
import {EDA} from '../eda/EDA';

export class SiteController extends Transaction implements IController {
  public constructor(stub: ChaincodeStub) {
    super(stub);
  }

  public async createSite(
    site: Site,
    organization: IOrganization
  ): Promise<Site> {
    Log.chaincode.info('====== Create Site ======');

    this.throwErrorIfOrganizationTypeIsNotAllowedToCreateSite(site);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!this.hasDSOOrganizationPermission(site, organization)) {
        throw new AssetError(
          site.siteId,
          this.constructor.name,
          `Organization does not have the permission to create Site.`
        );
      }
    }

    if (await new State(this.stub).isAssetRegistered(site.siteId)) {
      throw new Error(`${site.siteId} already exists.`);
    }

    await new State(this.stub).put(
      site.siteId,
      this.createSiteAssetForBlockChain(site)
    );

    return site;
  }

  public async updateSite(
    site: Site,
    organization: IOrganization
  ): Promise<Site> {
    this.throwErrorIfOrganizationTypeIsNotAllowedToUpdateSite(site);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!this.hasDSOOrganizationPermission(site, organization)) {
        throw new AssetError(
          site.siteId,
          this.constructor.name,
          `Organization does not have the permission to update Site.`
        );
      }
    }

    await new State(this.stub).put(
      site.siteId,
      this.createSiteAssetForBlockChain(site)
    );

    return site;
  }

  public async getSiteById(
    id: string,
    organization: IOrganization
  ): Promise<Site> {
    const site: Site = await new State(this.stub).get<Site>(id);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!this.hasDSOOrganizationPermission(site, organization)) {
        throw new AssetError(
          site.siteId,
          this.constructor.name,
          `Organization does not have the permission to get ${site.siteId}.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!(await this.hasBSPOrganizationPermission(site, organization))) {
        throw new AssetError(
          site.siteId,
          this.constructor.name,
          `Organization does not have the permission to get ${site.siteId}.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      if (!(await this.hasPRODUCEROrganizationPermission(site, organization))) {
        throw new AssetError(
          site.siteId,
          this.constructor.name,
          `Organization does not have the permission to get ${site.siteId}.`
        );
      }
    }

    return site;
  }

  public async getAllSites(organization: IOrganization): Promise<Site[]> {
    const sites: Site[] = await new State(this.stub).getAll<Site>(
      AssetType.Site
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllSitesWithReferenceToOrganization(
        sites,
        organization
      );
    }

    return sites;
  }

  public async getSiteByedaRegisteredResourceMrid(
    edaRegisteredResourceMrid: string,
    organization: IOrganization
  ): Promise<Site[]> {
    const query: Object = {
      edaRegisteredResourceId: edaRegisteredResourceMrid
    };

    const sites: Site[] = await new State(this.stub).getByQuery<Site>(
      AssetType.Site,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllSitesWithReferenceToOrganization(
        sites,
        organization
      );
    }

    return sites;
  }

  public async querySite(
    mapQuerySite: string,
    organization: IOrganization
  ): Promise<Site[]> {
    const query = this.buildQuery(mapQuerySite);

    const sites: Site[] = await new State(this.stub).getByQuery<Site>(
      AssetType.Site,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllSitesWithReferenceToOrganization(
        sites,
        organization
      );
    }

    return sites;
  }

  private async returnAllSitesWithReferenceToOrganization(
    sites: Site[],
    organization: IOrganization
  ): Promise<Site[]> {
    const sitesWithReferenceToOrganization: Site[] = [];

    for (const site of sites) {
      if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        !this.hasDSOOrganizationPermission(site, organization)
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.BSP) &&
        !(await this.hasBSPOrganizationPermission(site, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.PRODUCER) &&
        !(await this.hasPRODUCEROrganizationPermission(site, organization))
      ) {
        continue;
      }

      sitesWithReferenceToOrganization.push(site);
    }

    return sitesWithReferenceToOrganization;
  }

  private hasDSOOrganizationPermission(
    site: Site,
    organization: IOrganization
  ): boolean {
    return site.a04RegisteredResourceMrid === organization.organizationId;
  }

  private async hasBSPOrganizationPermission(
    site: Site,
    organization: IOrganization
  ): Promise<boolean> {
    const eda: EDA | undefined = await this.getAssetById(
      site.edaRegisteredResourceId
    );

    if (!eda) {
      return false;
    }

    return eda.a46Name === organization.organizationId;
  }

  private async hasPRODUCEROrganizationPermission(
    site: Site,
    organization: IOrganization
  ): Promise<boolean> {
    return site.producerIEC === organization.organizationId;
  }

  private throwErrorIfOrganizationTypeIsNotAllowedToCreateSite(
    site: Site
  ): void {
    if (
      this.isOrganizationType(OrganizationTypeMsp.TSO) &&
      site.voltageType === SiteType.HV
    ) {
      return;
    }

    if (
      this.isOrganizationType(OrganizationTypeMsp.DSO) &&
      site.voltageType === SiteType.MV
    ) {
      return;
    }

    if (
      this.isOrganizationType(OrganizationTypeMsp.TSO) ||
      this.isOrganizationType(OrganizationTypeMsp.DSO)
    ) {
      throw new AssetError(
        site.siteId,
        this.constructor.name,
        `OrganizationType is not allowed to create a site for ${site.voltageType} type.`
      );
    }

    throw new AssetError(
      site.siteId,
      this.constructor.name,
      'OrganizationType is not allowed to create a site.'
    );
  }

  private throwErrorIfOrganizationTypeIsNotAllowedToUpdateSite(
    site: Site
  ): void {
    if (
      this.isOrganizationType(OrganizationTypeMsp.TSO) &&
      site.voltageType === SiteType.HV
    ) {
      return;
    }

    if (
      this.isOrganizationType(OrganizationTypeMsp.DSO) &&
      site.voltageType === SiteType.MV
    ) {
      return;
    }

    if (
      this.isOrganizationType(OrganizationTypeMsp.TSO) ||
      this.isOrganizationType(OrganizationTypeMsp.DSO)
    ) {
      throw new AssetError(
        site.siteId,
        this.constructor.name,
        `OrganizationType is not allowed to update a site for ${site.voltageType} type.`
      );
    }

    throw new AssetError(
      site.siteId,
      this.constructor.name,
      'OrganizationType is not allowed to update Site.'
    );
  }

  private createSiteAssetForBlockChain(site: Site): Site {
    return new Site(
      site.siteId,
      site.edaRegisteredResourceId,
      site.nazaRegisteredResourceMrid,
      site.a04RegisteredResourceMrid,
      site.voltageType,
      site.objectAggregationMeteringPoint,
      site.siteName,
      site.siteSIRET,
      site.siteLocation,
      site.a04Name,
      site.siteType,
      site.siteIEC,
      site.producerName,
      site.producerIEC
    );
  }

  private buildQuery(mapQuerySite: string): any {
    const site: Site = JSON.parse(mapQuerySite);

    return {
      siteId: site.siteId ? {$eq: site.siteId} : {$ne: null},
      edaRegisteredResourceId: site.edaRegisteredResourceId
        ? {$eq: site.edaRegisteredResourceId}
        : {$ne: null},
      nazaRegisteredResourceMrid: site.nazaRegisteredResourceMrid
        ? {$elemMatch: {$eq: site.nazaRegisteredResourceMrid}}
        : {$ne: null},
      a04RegisteredResourceMrid: site.a04RegisteredResourceMrid
        ? {$eq: site.a04RegisteredResourceMrid}
        : {$ne: null},
      objectAggregationMeteringPoint: site.objectAggregationMeteringPoint
        ? {$eq: site.objectAggregationMeteringPoint}
        : {$ne: null},
      siteName: site.siteName ? {$eq: site.siteName} : {$ne: null},
      siteSIRET: site.siteSIRET ? {$eq: site.siteSIRET} : {$ne: null},
      siteLocation: site.siteLocation ? {$eq: site.siteLocation} : {$ne: null},
      a04Name: site.a04Name ? {$eq: site.a04Name} : {$ne: null},
      siteType: site.siteType ? {$eq: site.siteType} : {$ne: null},
      siteIEC: site.siteIEC ? {$eq: site.siteIEC} : {$ne: null},
      producerName: site.producerName ? {$eq: site.producerName} : {$ne: null}
    };
  }
}
