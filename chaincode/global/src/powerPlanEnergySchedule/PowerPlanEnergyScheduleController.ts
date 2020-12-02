/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {Log} from '../../logger/Log';
import {State} from '../State';
import {PowerPlanEnergySchedule} from './PowerPlanEnergySchedule';
import {IController} from '../../interfaces/IController';
import {AssetType} from '../../enums/AssetType';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {AssetError} from '../common/AssetError';
import {Transaction} from '../Transaction';
import {EDP} from '../edp/EDP';
import {IOrganization} from '../../interfaces/IOrganization';
import {Site} from '../site/Site';
import {EDA} from '../eda/EDA';

export class PowerPlanEnergyScheduleController extends Transaction
  implements IController {
  public constructor(readonly stub: ChaincodeStub) {
    super(stub);
  }

  public async createPowerPlanEnergySchedule(
    powerPlanEnergySchedule: PowerPlanEnergySchedule,
    organization: IOrganization
  ): Promise<PowerPlanEnergySchedule> {
    Log.chaincode.debug('====== Create PowerPlanEnergySchedule ======');

    if (!this.isOrganizationTypeAllowedToCreateAsset(OrganizationTypeMsp.BSP)) {
      throw new AssetError(
        powerPlanEnergySchedule.powerPlanEnergyScheduleId,
        this.constructor.name,
        'OrganizationType is not allowed to create a PowerPlanEnergySchedule.'
      );
    }

    if (
      !(await this.hasBSPOrganizationPermission(
        powerPlanEnergySchedule,
        organization
      ))
    ) {
      throw new AssetError(
        powerPlanEnergySchedule.powerPlanEnergyScheduleId,
        this.constructor.name,
        'Organization does not have permission to create PowerPlanEnergySchedule.'
      );
    }

    if (
      await new State(this.stub).isAssetRegistered(
        powerPlanEnergySchedule.powerPlanEnergyScheduleId
      )
    ) {
      throw new Error(
        `${powerPlanEnergySchedule.powerPlanEnergyScheduleId} already exists.`
      );
    }

    await new State(this.stub).put(
      powerPlanEnergySchedule.powerPlanEnergyScheduleId,
      this.createPowerPlanEnergyScheduleForBlockchain(powerPlanEnergySchedule)
    );

    return powerPlanEnergySchedule;
  }

  public async updatePowerPlanEnergySchedule(
    powerPlanEnergySchedule: PowerPlanEnergySchedule
  ): Promise<PowerPlanEnergySchedule> {
    await new State(this.stub).update<PowerPlanEnergySchedule>(
      powerPlanEnergySchedule.powerPlanEnergyScheduleId,
      this.createPowerPlanEnergyScheduleForBlockchain(powerPlanEnergySchedule)
    );

    return powerPlanEnergySchedule;
  }

  public async getPowerPlanEnergySchedule(
    id: string,
    organization: IOrganization
  ): Promise<PowerPlanEnergySchedule> {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule = await new State(
      this.stub
    ).get<PowerPlanEnergySchedule>(id);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (
        !(await this.hasDSOOrganizationPermission(
          powerPlanEnergySchedule,
          organization
        ))
      ) {
        throw new AssetError(
          powerPlanEnergySchedule.powerPlanEnergyScheduleId,
          this.constructor.name,
          'Organization does not have permission to get this PowerPlanEnergySchedule.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (
        !(await this.hasBSPOrganizationPermission(
          powerPlanEnergySchedule,
          organization
        ))
      ) {
        throw new AssetError(
          powerPlanEnergySchedule.powerPlanEnergyScheduleId,
          this.constructor.name,
          'Organization does not have permission to get this PowerPlanEnergySchedule.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      throw new AssetError(
        powerPlanEnergySchedule.powerPlanEnergyScheduleId,
        this.constructor.name,
        'OrganizationType does not have permission to get this PowerPlanEnergySchedule.'
      );
    }

    return powerPlanEnergySchedule;
  }

  public async queryPowerPlanEnergySchedule(
    mapQueryPowerPlanEnergySchedule: string,
    organization: IOrganization
  ): Promise<PowerPlanEnergySchedule[]> {
    const query = this.buildQuery(mapQueryPowerPlanEnergySchedule);

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      return [];
    }

    const powerPlanEnergySchedules: PowerPlanEnergySchedule[] = await new State(
      this.stub
    ).getByQuery<PowerPlanEnergySchedule>(
      AssetType.PowerPlanEnergySchedule,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllPowerPlanEnergySchedulesWithReferenceToOrganization(
        powerPlanEnergySchedules,
        organization
      );
    }

    return powerPlanEnergySchedules;
  }

  private async hasDSOOrganizationPermission(
    powerPlanEnergySchedule: PowerPlanEnergySchedule,
    organization: IOrganization
  ): Promise<boolean> {
    const edp: EDP | undefined = await this.getAssetById(
      powerPlanEnergySchedule.edpRegisteredResourceId
    );
    if (!edp) {
      return false;
    }

    const site: Site | undefined = await this.getAssetById(edp.siteId);
    if (!site) {
      return false;
    }

    return site.a04RegisteredResourceMrid === organization.organizationId;
  }

  private async hasBSPOrganizationPermission(
    powerPlanEnergySchedule: PowerPlanEnergySchedule,
    organization: IOrganization
  ): Promise<boolean> {
    const edp: EDP | undefined = await this.getAssetById(
      powerPlanEnergySchedule.edpRegisteredResourceId
    );
    if (!edp) {
      return false;
    }

    const site: Site | undefined = await this.getAssetById(edp.siteId);
    if (!site) {
      return false;
    }

    const eda: EDA = await this.getAssetById(site.edaRegisteredResourceId);
    if (!eda) {
      return false;
    }

    return eda.a46Name === organization.organizationId;
  }

  private async returnAllPowerPlanEnergySchedulesWithReferenceToOrganization(
    powerPlanEnergySchedules: PowerPlanEnergySchedule[],
    organization: IOrganization
  ): Promise<PowerPlanEnergySchedule[]> {
    const powerPlanEnergySchedulesWithReferenceToOrganization: PowerPlanEnergySchedule[] = [];

    for (const powerPlanEnergySchedule of powerPlanEnergySchedules) {
      if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        !(await this.hasDSOOrganizationPermission(
          powerPlanEnergySchedule,
          organization
        ))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.BSP) &&
        !(await this.hasBSPOrganizationPermission(
          powerPlanEnergySchedule,
          organization
        ))
      ) {
        continue;
      }

      powerPlanEnergySchedulesWithReferenceToOrganization.push(
        powerPlanEnergySchedule
      );
    }

    return powerPlanEnergySchedulesWithReferenceToOrganization;
  }

  private createPowerPlanEnergyScheduleForBlockchain(
    powerPlanEnergySchedule: PowerPlanEnergySchedule
  ): PowerPlanEnergySchedule {
    return new PowerPlanEnergySchedule(
      powerPlanEnergySchedule.powerPlanEnergyScheduleId,
      powerPlanEnergySchedule.edpRegisteredResourceId,
      powerPlanEnergySchedule.edpRegisteredResourceMrid,
      powerPlanEnergySchedule.timeIntervalStart,
      powerPlanEnergySchedule.timeIntervalEnd,
      powerPlanEnergySchedule.resolution,
      powerPlanEnergySchedule.pointType,
      powerPlanEnergySchedule.timeZone,
      powerPlanEnergySchedule.timeSeries,
      powerPlanEnergySchedule.powerPlanEnergyScheduleMrid,
      powerPlanEnergySchedule.powerPlanEnergyScheduleStatus,
      powerPlanEnergySchedule.curveType
    );
  }

  private buildQuery(mapQueryPowerPlanEnergySchedule: string): any {
    const powerPlanEnergySchedule: PowerPlanEnergySchedule = JSON.parse(
      mapQueryPowerPlanEnergySchedule
    );

    return {
      powerPlanEnergyScheduleId: powerPlanEnergySchedule.powerPlanEnergyScheduleId
        ? {$eq: powerPlanEnergySchedule.powerPlanEnergyScheduleId}
        : {$ne: null},
      edpRegisteredResourceMrid: powerPlanEnergySchedule.edpRegisteredResourceMrid
        ? {$eq: powerPlanEnergySchedule.edpRegisteredResourceMrid}
        : {$ne: null},
      edpRegisteredResourceId: powerPlanEnergySchedule.edpRegisteredResourceId
        ? {$eq: powerPlanEnergySchedule.edpRegisteredResourceId}
        : {$ne: null},
      timeIntervalStart: powerPlanEnergySchedule.timeIntervalStart
        ? {$gte: powerPlanEnergySchedule.timeIntervalStart}
        : {$ne: null},
      timeIntervalEnd: powerPlanEnergySchedule.timeIntervalEnd
        ? {$lte: powerPlanEnergySchedule.timeIntervalEnd}
        : {$ne: null}
    };
  }
}
