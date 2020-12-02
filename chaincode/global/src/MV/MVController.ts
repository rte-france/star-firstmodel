/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {Log} from '../../logger/Log';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {MV} from './MV';
import {AssetType} from '../../enums/AssetType';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {AssetError} from '../common/AssetError';
import {Transaction} from '../Transaction';
import {Site} from '../site/Site';
import {IOrganization} from '../../interfaces/IOrganization';
import {EDA} from '../eda/EDA';

export class MVController extends Transaction implements IController {
  public constructor(readonly stub: ChaincodeStub) {
    super(stub);
  }

  public async createMV(mv: MV, organization: IOrganization): Promise<MV> {
    Log.chaincode.debug('====== Create MV ');

    if (!this.isOrganizationTypeAllowedToCreateAsset(OrganizationTypeMsp.DSO)) {
      throw new AssetError(
        mv.energyAccountMarketDocumentMrid,
        this.constructor.name,
        'OrganizationType is not allowed to create MV.'
      );
    }

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!(await this.hasDSOOrganizationPermission(mv, organization))) {
        throw new AssetError(
          mv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to create MV.'
        );
      }
    }

    if (
      await new State(this.stub).isAssetRegistered(
        mv.energyAccountMarketDocumentMrid
      )
    ) {
      Log.chaincode.error('====== ERROR Create MV ======');
      throw new Error(`${mv.energyAccountMarketDocumentMrid} already exists.`);
    }

    await new State(this.stub).put(
      mv.energyAccountMarketDocumentMrid,
      this.createMVForBlockchain(mv)
    );

    return mv;
  }

  public async updateMV(mv: MV, organization: IOrganization): Promise<MV> {
    Log.chaincode.debug('====== Update MV ======');

    if (!this.isOrganizationTypeAllowedToUpdateMV()) {
      throw new AssetError(
        mv.energyAccountMarketDocumentMrid,
        this.constructor.name,
        'OrganizationType is not allowed to update MV.'
      );
    }

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!(await this.hasDSOOrganizationPermission(mv, organization))) {
        throw new AssetError(
          mv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to update MV.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!(await this.hasBSPOrganizationPermission(mv, organization))) {
        throw new AssetError(
          mv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to update MV.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      if (!(await this.hasPRODUCEROrganizationPermission(mv, organization))) {
        throw new AssetError(
          mv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to update MV.'
        );
      }
    }

    await new State(this.stub).update<MV>(
      mv.energyAccountMarketDocumentMrid,
      this.createMVForBlockchain(mv)
    );

    return mv;
  }

  public async getMV(id: string, organization: IOrganization): Promise<MV> {
    const mv: MV = await new State(this.stub).get<MV>(id);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!(await this.hasDSOOrganizationPermission(mv, organization))) {
        throw new AssetError(
          mv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to get MV.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!(await this.hasBSPOrganizationPermission(mv, organization))) {
        throw new AssetError(
          mv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to get MV.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      if (!(await this.hasPRODUCEROrganizationPermission(mv, organization))) {
        throw new AssetError(
          mv.energyAccountMarketDocumentMrid,
          this.constructor.name,
          'Organization does not have permission to get MV.'
        );
      }
    }

    return mv;
  }

  public async queryMV(
    mapQueryMV: string,
    organization: IOrganization
  ): Promise<MV[]> {
    const query = this.buildQuery(mapQueryMV);

    const mvs: MV[] = await new State(this.stub).getByQuery<MV>(
      AssetType.MV,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllMVsWithReferenceToOrganization(
        mvs,
        organization
      );
    }

    return mvs;
  }

  private async hasBSPOrganizationPermission(
    mv: MV,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site | undefined = await this.getAssetById(mv.siteId);

    if (!site) {
      return false;
    }

    const eda: EDA = await this.getAssetById(site.edaRegisteredResourceId);

    if (!eda) {
      return false;
    }

    return eda.a46Name === organization.organizationId;
  }

  private async hasDSOOrganizationPermission(
    mv: MV,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site | undefined = await this.getAssetById(mv.siteId);

    if (!site) {
      return false;
    }

    return site.a04RegisteredResourceMrid === organization.organizationId;
  }

  private async hasPRODUCEROrganizationPermission(
    mv: MV,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site | undefined = await this.getAssetById(mv.siteId);

    if (!site) {
      return false;
    }

    return site.producerIEC === organization.organizationId;
  }

  private async returnAllMVsWithReferenceToOrganization(
    mvs: MV[],
    organization: IOrganization
  ): Promise<MV[]> {
    const mvsWithReferenceToOrganization: MV[] = [];

    for (const mv of mvs) {
      if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        !(await this.hasDSOOrganizationPermission(mv, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.BSP) &&
        !(await this.hasBSPOrganizationPermission(mv, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.PRODUCER) &&
        !(await this.hasPRODUCEROrganizationPermission(mv, organization))
      ) {
        continue;
      }

      mvsWithReferenceToOrganization.push(mv);
    }

    return mvsWithReferenceToOrganization;
  }

  private isOrganizationTypeAllowedToUpdateMV(): boolean {
    return !this.isOrganizationType(OrganizationTypeMsp.TSO);
  }

  private createMVForBlockchain(mv: MV): MV {
    return new MV(
      mv.energyAccountMarketDocumentMrid,
      mv.siteId,
      mv.objectAggregationMeteringPoint,
      mv.timeIntervalStart,
      mv.timeIntervalEnd,
      mv.resolution,
      mv.pointType,
      mv.timeZone,
      mv.timeSeries,
      mv.revisionNumber,
      mv.type,
      mv.docStatus,
      mv.processType,
      mv.classificationType,
      mv.senderMarketParticipantMRID,
      mv.senderMarketParticipantRole,
      mv.receiverMarketParticipantMRID,
      mv.receiverMarketParticipantMarketRoleType,
      mv.createdDateTime,
      mv.measurementUnitName,
      mv.areaDomain,
      mv.marketEvaluationPointMrid
    );
  }

  private buildQuery(mapQueryMV: string): any {
    const mv: MV = JSON.parse(mapQueryMV);

    return {
      energyAccountMarketDocumentMrid: mv.energyAccountMarketDocumentMrid
        ? {$eq: mv.energyAccountMarketDocumentMrid}
        : {$ne: null},
      siteId: mv.siteId ? {$eq: mv.siteId} : {$ne: null},
      objectAggregationMeteringPoint: mv.objectAggregationMeteringPoint
        ? {$eq: mv.objectAggregationMeteringPoint}
        : {$ne: null},
      timeIntervalStart: mv.timeIntervalStart
        ? {$gte: mv.timeIntervalStart}
        : {$ne: null},
      timeIntervalEnd: mv.timeIntervalEnd
        ? {$lte: mv.timeIntervalEnd}
        : {$ne: null}
    };
  }
}
