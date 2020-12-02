/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {Log} from '../../logger/Log';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {HV} from './HV';
import {AssetType} from '../../enums/AssetType';
import {AssetError} from '../common/AssetError';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {Transaction} from '../Transaction';
import {IOrganization} from '../../interfaces/IOrganization';
import {Site} from '../site/Site';
import {EDA} from '../eda/EDA';

export class HVController extends Transaction implements IController {
  public constructor(readonly stub: ChaincodeStub) {
    super(stub);
  }

  public async createHV(hv: HV): Promise<HV> {
    Log.chaincode.debug('====== Create HV ');

    if (!this.isOrganizationTypeAllowedToCreateAsset(OrganizationTypeMsp.TSO)) {
      throw new AssetError(
        hv.energyAccountMarketDocumentMrid,
        this.constructor.name,
        'OrganizationType is not allowed to create HV.'
      );
    }

    if (
      await new State(this.stub).isAssetRegistered(
        hv.energyAccountMarketDocumentMrid
      )
    ) {
      Log.chaincode.error('====== ERROR Create HV ======');
      throw new Error(`${hv.energyAccountMarketDocumentMrid} already exists.`);
    }

    await new State(this.stub).put(
      hv.energyAccountMarketDocumentMrid,
      this.createHVForBlockchain(hv)
    );

    return hv;
  }

  public async updateHV(hv: HV, organization: IOrganization): Promise<HV> {
    Log.chaincode.debug('====== Update HV ======');

    if (!this.isOrganizationTypeAllowedToUpdateHV()) {
      throw new AssetError(
        hv.energyAccountMarketDocumentMrid,
        this.constructor.name,
        'OrganizationType is not allowed to update HV.'
      );
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!(await this.hasBSPOrganizationPermission(hv, organization))) {
        throw new AssetError(
          hv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to update HV.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      if (!(await this.hasPRODUCEROrganizationPermission(hv, organization))) {
        throw new AssetError(
          hv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to update HV.'
        );
      }
    }

    await new State(this.stub).update<HV>(
      hv.energyAccountMarketDocumentMrid,
      this.createHVForBlockchain(hv)
    );

    return hv;
  }

  public async getHV(id: string, organization: IOrganization): Promise<HV> {
    const hv: HV = await new State(this.stub).get<HV>(id);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!(await this.hasDSOOrganizationPermission(hv, organization))) {
        throw new AssetError(
          hv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to get HV.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!(await this.hasBSPOrganizationPermission(hv, organization))) {
        throw new AssetError(
          hv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to get HV.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      if (!(await this.hasPRODUCEROrganizationPermission(hv, organization))) {
        throw new AssetError(
          hv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to get HV.'
        );
      }
    }

    return hv;
  }

  public async queryHV(
    mapQueryHV: string,
    organization: IOrganization
  ): Promise<HV[]> {
    const query = this.buildQuery(mapQueryHV);

    const hvs: HV[] = await new State(this.stub).getByQuery<HV>(
      AssetType.HV,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllHVsWithReferenceToOrganization(
        hvs,
        organization
      );
    }

    return hvs;
  }

  private isOrganizationTypeAllowedToUpdateHV(): boolean {
    return !this.isOrganizationType(OrganizationTypeMsp.DSO);
  }

  private async hasDSOOrganizationPermission(
    hv: HV,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site = await this.getAssetById(hv.siteId);

    if (!site) {
      return false;
    }

    return site.a04RegisteredResourceMrid === organization.organizationId;
  }

  private async hasPRODUCEROrganizationPermission(
    hv: HV,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site = await this.getAssetById(hv.siteId);

    if (!site) {
      return false;
    }

    return site.producerIEC === organization.organizationId;
  }

  private async hasBSPOrganizationPermission(
    hv: HV,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site = await this.getAssetById(hv.siteId);

    if (!site) {
      return false;
    }

    const eda: EDA = await this.getAssetById(site.edaRegisteredResourceId);

    if (!eda) {
      return false;
    }

    return eda.a46Name === organization.organizationId;
  }

  private async returnAllHVsWithReferenceToOrganization(
    hvs: HV[],
    organization: IOrganization
  ): Promise<HV[]> {
    const hvsWithReferenceToOrganization: HV[] = [];

    for (const hv of hvs) {
      if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        !(await this.hasDSOOrganizationPermission(hv, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.BSP) &&
        !(await this.hasBSPOrganizationPermission(hv, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.PRODUCER) &&
        !(await this.hasPRODUCEROrganizationPermission(hv, organization))
      ) {
        continue;
      }

      hvsWithReferenceToOrganization.push(hv);
    }

    return hvsWithReferenceToOrganization;
  }

  private createHVForBlockchain(hv: HV): HV {
    return new HV(
      hv.energyAccountMarketDocumentMrid,
      hv.siteId,
      hv.ppeSiteCode,
      hv.timeIntervalStart,
      hv.timeIntervalEnd,
      hv.resolution,
      hv.pointType,
      hv.timeZone,
      hv.timeSeries,
      hv.revisionNumber,
      hv.type,
      hv.docStatus,
      hv.processType,
      hv.classificationType,
      hv.senderMarketParticipantMRID,
      hv.senderMarketParticipantRole,
      hv.receiverMarketParticipantMRID,
      hv.receiverMarketParticipantMarketRoleType,
      hv.createdDateTime,
      hv.measurementUnitName,
      hv.areaDomain,
      hv.marketEvaluationPointMrid
    );
  }

  private buildQuery(mapQueryHV: string): any {
    const hv: HV = JSON.parse(mapQueryHV);

    return {
      energyAccountMarketDocumentMrid: hv.energyAccountMarketDocumentMrid
        ? {$eq: hv.energyAccountMarketDocumentMrid}
        : {$ne: null},
      siteId: hv.siteId ? {$eq: hv.siteId} : {$ne: null},
      ppeSiteCode: hv.ppeSiteCode ? {$eq: hv.ppeSiteCode} : {$ne: null},
      timeIntervalStart: hv.timeIntervalStart
        ? {$gte: hv.timeIntervalStart}
        : {$ne: null},
      timeIntervalEnd: hv.timeIntervalEnd
        ? {$lte: hv.timeIntervalEnd}
        : {$ne: null}
    };
  }
}
