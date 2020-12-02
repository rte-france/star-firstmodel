/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {EDA} from './EDA';
import {Log} from '../../logger/Log';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {AssetType} from '../../enums/AssetType';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {AssetError} from '../common/AssetError';
import {Transaction} from '../Transaction';
import {Site} from '../site/Site';
import {IOrganization} from '../../interfaces/IOrganization';

export class EDAController extends Transaction implements IController {
  public constructor(readonly stub: ChaincodeStub) {
    super(stub);
  }

  public async createEDA(eda: EDA): Promise<EDA> {
    Log.chaincode.debug('====== Create EDA ======');

    if (!this.isOrganizationTypeAllowedToCreateAsset(OrganizationTypeMsp.TSO)) {
      throw new AssetError(
        eda.edaRegisteredResourceId,
        this.constructor.name,
        'OrganizationType is not allowed to create an EDA.'
      );
    }

    if (
      await new State(this.stub).isAssetRegistered(eda.edaRegisteredResourceId)
    ) {
      throw new Error(`${eda.edaRegisteredResourceId} already exists.`);
    }
    await new State(this.stub).put(
      eda.edaRegisteredResourceId,
      this.createEDAAssetForBlockChain(eda)
    );

    return eda;
  }

  public async updateEDA(eda: EDA, organization: IOrganization): Promise<EDA> {
    Log.chaincode.debug('====== Update EDA ======');

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!(await this.hasDSOOrganizationPermission(eda, organization))) {
        throw new AssetError(
          eda.edaRegisteredResourceId,
          this.constructor.name,
          `Organization is not allowed to update ${eda.edaRegisteredResourceId}.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!this.hasBSPOrganizationPermission(eda, organization)) {
        throw new AssetError(
          eda.edaRegisteredResourceId,
          this.constructor.name,
          `BSP Organization is not allowed to update ${eda.edaRegisteredResourceId}.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      throw new AssetError(
        eda.edaRegisteredResourceId,
        this.constructor.name,
        `OrganizationType is not allowed to update ${eda.edaRegisteredResourceId}.`
      );
    }

    await new State(this.stub).update<EDA>(
      eda.edaRegisteredResourceId,
      this.createEDAAssetForBlockChain(eda)
    );

    return eda;
  }

  public async getEDAbyId(
    id: string,
    organization: IOrganization
  ): Promise<EDA> {
    const eda: EDA = await new State(this.stub).get<EDA>(id);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!(await this.hasDSOOrganizationPermission(eda, organization))) {
        throw new AssetError(
          eda.edaRegisteredResourceId,
          this.constructor.name,
          `DSO organization has no permission to get ${eda.edaRegisteredResourceId}.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!this.hasBSPOrganizationPermission(eda, organization)) {
        throw new AssetError(
          eda.edaRegisteredResourceId,
          this.constructor.name,
          `BSP organization has no permission to get ${eda.edaRegisteredResourceId}.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      throw new AssetError(
        eda.edaRegisteredResourceId,
        this.constructor.name,
        `OrganizationType is not allowed to get ${eda.edaRegisteredResourceId}.`
      );
    }

    return eda;
  }

  public async getAllEDAs(organization: IOrganization): Promise<EDA[]> {
    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      return [];
    }

    const EDAs: EDA[] = await new State(this.stub).getAll<EDA>(AssetType.EDA);

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllEDAsWithReferenceToOrganization(
        EDAs,
        organization
      );
    }

    return EDAs;
  }

  public async queryEDA(
    EDAQuery: string,
    organization: IOrganization
  ): Promise<EDA[]> {
    const query = this.buildQuery(EDAQuery);
    Log.chaincode.debug('====== QUERY EDA ======');

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      return [];
    }

    const EDAs: EDA[] = await new State(this.stub).getByQuery<EDA>(
      AssetType.EDA,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllEDAsWithReferenceToOrganization(
        EDAs,
        organization
      );
    }

    return EDAs;
  }

  private async hasDSOOrganizationPermission(
    eda: EDA,
    organization: IOrganization
  ): Promise<boolean> {
    const sites: Site[] = await new State(this.stub).getAll<Site>(
      AssetType.Site
    );
    const edaSite: Site | undefined = sites.find(
      (site) => site.edaRegisteredResourceId === eda.edaRegisteredResourceId
    );

    if (!edaSite) {
      return false;
    }

    return edaSite.a04RegisteredResourceMrid === organization.organizationId;
  }

  private hasBSPOrganizationPermission(
    eda: EDA,
    organization: IOrganization
  ): boolean {
    return eda.a46Name === organization.organizationId;
  }

  private async returnAllEDAsWithReferenceToOrganization(
    edaArray: EDA[],
    organization: IOrganization
  ): Promise<EDA[]> {
    let EDAsWithReferenceToOrganization: EDA[] = [];

    for (const eda of edaArray) {
      if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        !(await this.hasDSOOrganizationPermission(eda, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.BSP) &&
        !(await this.hasBSPOrganizationPermission(eda, organization))
      ) {
        continue;
      }

      EDAsWithReferenceToOrganization.push(eda);
    }

    return EDAsWithReferenceToOrganization;
  }

  private createEDAAssetForBlockChain(eda: EDA): EDA {
    return new EDA(
      eda.edaRegisteredResourceId,
      eda.a46Name,
      eda.edaRegisteredResourceName,
      eda.edaRegisteredResourceMrid,
      eda.a46IEC
    );
  }

  private buildQuery(mapQueryEDA: string): any {
    const eda: EDA = JSON.parse(mapQueryEDA);

    return {
      edaRegisteredResourceId: eda.edaRegisteredResourceId
        ? {$eq: eda.edaRegisteredResourceId}
        : {$ne: null},
      a46Name: eda.a46Name ? {$eq: eda.a46Name} : {$ne: null},
      edaRegisteredResourceName: eda.edaRegisteredResourceName
        ? {$eq: eda.edaRegisteredResourceName}
        : {$ne: null},
      edaRegisteredResourceMrid: eda.edaRegisteredResourceMrid
        ? {$eq: eda.edaRegisteredResourceMrid}
        : {$ne: null},
      a46IEC: eda.a46IEC ? {$eq: eda.a46IEC} : {$ne: null}
    };
  }
}
