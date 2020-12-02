/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {EDP} from './EDP';
import {Log} from '../../logger/Log';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {AssetType} from '../../enums/AssetType';
import {AssetError} from '../common/AssetError';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {Transaction} from '../Transaction';
import {IOrganization} from '../../interfaces/IOrganization';
import {Site} from '../site/Site';
import {EDA} from '../eda/EDA';

export class EDPController extends Transaction implements IController {
  public constructor(readonly stub: ChaincodeStub) {
    super(stub);
  }

  public async createEDP(edp: EDP): Promise<EDP> {
    Log.chaincode.debug('====== Create EDP =====');

    if (!this.isOrganizationTypeAllowedToCreateAsset(OrganizationTypeMsp.TSO)) {
      throw new AssetError(
        edp.edpRegisteredResourceId,
        this.constructor.name,
        'OrganizationType is not allowed to create an EDP.'
      );
    }

    if (
      await new State(this.stub).isAssetRegistered(edp.edpRegisteredResourceId)
    ) {
      throw new Error(`${edp.edpRegisteredResourceId} already exists.`);
    }
    await new State(this.stub).put(
      edp.edpRegisteredResourceId,
      this.createEDPForBlockchain(edp)
    );

    return edp;
  }

  public async updateEDP(edp: EDP, organization: IOrganization): Promise<EDP> {
    Log.chaincode.debug('====== Update EDP ======');

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!(await this.hasDSOOrganizationPermission(edp, organization))) {
        throw new AssetError(
          edp.edpRegisteredResourceId,
          this.constructor.name,
          'Organization does not have permission to update EDP.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!(await this.hasBSPOrganizationPermission(edp, organization))) {
        throw new AssetError(
          edp.edpRegisteredResourceId,
          this.constructor.name,
          'Organization does not have permission to update EDP.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      if (!(await this.hasPRODUCEROrganizationPermission(edp, organization))) {
        throw new AssetError(
          edp.edpRegisteredResourceId,
          this.constructor.name,
          'Organization does not have permission to update EDP.'
        );
      }
    }

    await new State(this.stub).update<EDP>(
      edp.edpRegisteredResourceId,
      this.createEDPForBlockchain(edp)
    );

    return edp;
  }

  public async getEDP(id: string, organization: IOrganization): Promise<EDP> {
    const edp: EDP = await new State(this.stub).get<EDP>(id);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      if (!(await this.hasDSOOrganizationPermission(edp, organization))) {
        throw new AssetError(
          edp.edpRegisteredResourceId,
          this.constructor.name,
          'Organization does not have permission to get this EDP.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      if (!(await this.hasBSPOrganizationPermission(edp, organization))) {
        throw new AssetError(
          edp.edpRegisteredResourceId,
          this.constructor.name,
          'Organization does not have permission to get this EDP.'
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      if (!(await this.hasPRODUCEROrganizationPermission(edp, organization))) {
        throw new AssetError(
          edp.edpRegisteredResourceId,
          this.constructor.name,
          'Organization does not have permission to get this EDP.'
        );
      }
    }

    return edp;
  }

  public async queryEDP(
    EDPQuery: string,
    organization: IOrganization
  ): Promise<EDP[]> {
    const query = this.buildQuery(EDPQuery);

    const edps: EDP[] = await new State(this.stub).getByQuery<EDP>(
      AssetType.EDP,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllMVsWithReferenceToOrganization(
        edps,
        organization
      );
    }

    return edps;
  }

  private async hasDSOOrganizationPermission(
    edp: EDP,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site | undefined = await this.getAssetById(edp.siteId);

    if (!site) {
      return false;
    }

    return site.a04RegisteredResourceMrid === organization.organizationId;
  }

  private async hasPRODUCEROrganizationPermission(
    edp: EDP,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site | undefined = await this.getAssetById(edp.siteId);

    if (!site) {
      return false;
    }

    return site.producerIEC === organization.organizationId;
  }

  private async hasBSPOrganizationPermission(
    edp: EDP,
    organization: IOrganization
  ): Promise<boolean> {
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

  private async returnAllMVsWithReferenceToOrganization(
    edps: EDP[],
    organization: IOrganization
  ): Promise<EDP[]> {
    const edpsWithReferenceToOrganization: EDP[] = [];

    for (const edp of edps) {
      if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        !(await this.hasDSOOrganizationPermission(edp, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.BSP) &&
        !(await this.hasBSPOrganizationPermission(edp, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.PRODUCER) &&
        !(await this.hasPRODUCEROrganizationPermission(edp, organization))
      ) {
        continue;
      }

      edpsWithReferenceToOrganization.push(edp);
    }

    return edpsWithReferenceToOrganization;
  }

  private createEDPForBlockchain(edp: EDP): EDP {
    return new EDP(
      edp.edpRegisteredResourceId,
      edp.siteId,
      edp.edpRegisteredResourceName,
      edp.edpRegisteredResourceMrid
    );
  }

  private buildQuery(mapQueryEDP: string): any {
    const edp: EDP = JSON.parse(mapQueryEDP);

    return {
      edpRegisteredResourceId: edp.edpRegisteredResourceId
        ? {$eq: edp.edpRegisteredResourceId}
        : {$ne: null},
      siteId: edp.siteId ? {$eq: edp.siteId} : {$ne: null},
      edpRegisteredResourceName: edp.edpRegisteredResourceName
        ? {$eq: edp.edpRegisteredResourceName}
        : {$ne: null},
      edpRegisteredResourceMrid: edp.edpRegisteredResourceMrid
        ? {$eq: edp.edpRegisteredResourceMrid}
        : {$ne: null}
    };
  }
}
