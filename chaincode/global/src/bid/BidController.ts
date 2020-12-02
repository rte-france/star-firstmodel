/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {Bid} from './Bid';
import {Log} from '../../logger/Log';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {AssetType} from '../../enums/AssetType';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {AssetError} from '../common/AssetError';
import {Transaction} from '../Transaction';
import {IOrganization} from '../../interfaces/IOrganization';
import {Site} from '../site/Site';
import {EDA} from '../eda/EDA';

export class BidController extends Transaction implements IController {
  public constructor(readonly stub: ChaincodeStub) {
    super(stub);
  }

  public async createBid(bid: Bid, organization: IOrganization): Promise<Bid> {
    Log.chaincode.debug('====== Create Bid ======');

    if (!this.isOrganizationTypeAllowedToCreateAsset(OrganizationTypeMsp.BSP)) {
      throw new AssetError(
        bid.bidId,
        this.constructor.name,
        `OrganizationType is not allowed to create a Bid.`
      );
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      const edas: EDA[] = await new State(this.stub).getAll<EDA>(AssetType.EDA);

      if (!(await this.hasBSPOrganizationPermission(bid, edas, organization))) {
        throw new AssetError(
          bid.bidId,
          this.constructor.name,
          `BSP Organization does not have the permission to create Bid.`
        );
      }
    }

    if (await new State(this.stub).isAssetRegistered(bid.bidId)) {
      throw new Error(`${bid.bidId} already exists.`);
    }

    await new State(this.stub).put(
      bid.bidId,
      this.createBidAssetForBlockChain(bid)
    );

    return bid;
  }

  public async updateBid(bid: Bid, organization: IOrganization): Promise<Bid> {
    Log.chaincode.debug('====== Update Bid ======');

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      const sites: Site[] = await new State(this.stub).getAll<Site>(
        AssetType.Site
      );

      if (
        !(await this.hasDSOOrganizationPermission(bid, sites, organization))
      ) {
        throw new AssetError(
          bid.bidId,
          this.constructor.name,
          `DSO Organization does not have the permission to update Bid.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      const edas: EDA[] = await new State(this.stub).getAll<EDA>(AssetType.EDA);

      if (!(await this.hasBSPOrganizationPermission(bid, edas, organization))) {
        throw new AssetError(
          bid.bidId,
          this.constructor.name,
          `BSP Organization does not have the permission to update Bid.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      throw new AssetError(
        bid.bidId,
        this.constructor.name,
        `Producer OrganizationType does not have permission to update Bid.`
      );
    }

    await new State(this.stub).update<Bid>(
      bid.bidId,
      this.createBidAssetForBlockChain(bid)
    );

    return bid;
  }

  public async getBid(id: string, organization: IOrganization): Promise<Bid> {
    const bid: Bid = await new State(this.stub).get<Bid>(id);

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      const sites: Site[] = await new State(this.stub).getAll<Site>(
        AssetType.Site
      );

      if (
        !(await this.hasDSOOrganizationPermission(bid, sites, organization))
      ) {
        throw new AssetError(
          bid.bidId,
          this.constructor.name,
          `DSO Organization does not have the permission to get Bid.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      const edas: EDA[] = await new State(this.stub).getAll<EDA>(AssetType.EDA);

      if (!(await this.hasBSPOrganizationPermission(bid, edas, organization))) {
        throw new AssetError(
          bid.bidId,
          this.constructor.name,
          `BSP Organization does not have the permission to get Bid.`
        );
      }
    }

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      throw new AssetError(
        bid.bidId,
        this.constructor.name,
        `Producer OrganizationType does not have permission to get Bid.`
      );
    }

    return bid;
  }

  public async getAllBids(organization: IOrganization): Promise<Bid[]> {
    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      return [];
    }

    const bids: Bid[] = await new State(this.stub).getAll<Bid>(AssetType.Bid);

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllBidsWithReferenceToOrganization(
        bids,
        organization
      );
    }

    return bids;
  }

  public async queryBid(
    mapQueryBid: string,
    organization: IOrganization
  ): Promise<Bid[]> {
    const query = this.buildQuery(mapQueryBid);

    if (this.isOrganizationType(OrganizationTypeMsp.PRODUCER)) {
      return [];
    }

    const bids: Bid[] = await new State(this.stub).getByQuery<Bid>(
      AssetType.Bid,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllBidsWithReferenceToOrganization(
        bids,
        organization
      );
    }

    return bids;
  }

  private async returnAllBidsWithReferenceToOrganization(
    bids: Bid[],
    organization: IOrganization
  ): Promise<Bid[]> {
    const bidsWithReferenceToOrganization: Bid[] = [];
    let sites: Site[] = [];
    let edas: EDA[] = [];

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      sites = await new State(this.stub).getAll<Site>(AssetType.Site);
    }

    if (this.isOrganizationType(OrganizationTypeMsp.BSP)) {
      edas = await new State(this.stub).getAll<EDA>(AssetType.EDA);
    }

    for (const bid of bids) {
      if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        !(await this.hasDSOOrganizationPermission(bid, sites, organization))
      ) {
        continue;
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.BSP) &&
        !(await this.hasBSPOrganizationPermission(bid, edas, organization))
      ) {
        continue;
      }

      bidsWithReferenceToOrganization.push(bid);
    }

    return bidsWithReferenceToOrganization;
  }

  private async hasDSOOrganizationPermission(
    bid: Bid,
    allSites: Site[],
    organization: IOrganization
  ): Promise<boolean> {
    const sites: Site[] = allSites.filter(
      (currentSite) =>
        currentSite.edaRegisteredResourceId === bid.edaRegisteredResourceId
    );

    if (sites.length === 0) {
      return false;
    }

    for (const site of sites) {
      if (site.a04RegisteredResourceMrid === organization.organizationId) {
        return true;
      }
    }

    return false;
  }

  private async hasBSPOrganizationPermission(
    bid: Bid,
    allEDAs: EDA[],
    organization: IOrganization
  ): Promise<boolean> {
    const edas: EDA[] = allEDAs.filter(
      (currentEDA) =>
        currentEDA.edaRegisteredResourceId === bid.edaRegisteredResourceId
    );

    if (edas.length === 0) {
      return false;
    }

    for (const eda of edas) {
      if (eda.a46Name === organization.organizationId) {
        return true;
      }
    }

    return false;
  }

  private createBidForBlockchain(bid: Bid): Bid {
    return new Bid(
      bid.bidId,
      bid.edaRegisteredResourceId,
      bid.edaRegisteredResourceMrid,
      bid.bidRegisteredResourceMrid,
      bid.timeIntervalStart,
      bid.timeIntervalEnd,
      bid.resolution,
      bid.pointType,
      bid.timeZone,
      bid.timeSeries
    );
  }

  private buildQuery(mapQueryBid: string): any {
    const bid: Bid = JSON.parse(mapQueryBid);

    return {
      bidId: bid.bidId ? {$eq: bid.bidId} : {$ne: null},
      edaRegisteredResourceId: bid.edaRegisteredResourceId
        ? {$eq: bid.edaRegisteredResourceId}
        : {$ne: null},
      edaRegisteredResourceMrid: bid.edaRegisteredResourceMrid
        ? {$eq: bid.edaRegisteredResourceMrid}
        : {$ne: null},
      bidRegisteredResourceMrid: bid.bidRegisteredResourceMrid
        ? {$eq: bid.bidRegisteredResourceMrid}
        : {$ne: null},
      timeIntervalStart: bid.timeIntervalStart
        ? {$gte: bid.timeIntervalStart}
        : {$ne: null},
      timeIntervalEnd: bid.timeIntervalEnd
        ? {$lte: bid.timeIntervalEnd}
        : {$ne: null}
    };
  }

  private createBidAssetForBlockChain(bid: Bid): Bid {
    return new Bid(
      bid.bidId,
      bid.edaRegisteredResourceId,
      bid.edaRegisteredResourceMrid,
      bid.bidRegisteredResourceMrid,
      bid.timeIntervalStart,
      bid.timeIntervalEnd,
      bid.resolution,
      bid.pointType,
      bid.timeZone,
      bid.timeSeries,
      bid.type,
      bid.processType,
      bid.senderMarketParticipantMrid,
      bid.senderMarketParticipantMarketRoleType,
      bid.receiverMarketParticipantMrid,
      bid.receiverMarketParticipantMarketRoleType,
      bid.createdDateTime,
      bid.domainMrid,
      bid.subjectMarketParticipantMrid,
      bid.subjectMarketParticipantMarketRoleType,
      bid.businessType,
      bid.acquiringDomainMrid,
      bid.connectingDomainMrid,
      bid.providerMarketParticipantMrid,
      bid.quantityMeasureUnitName,
      bid.currencyUnitName,
      bid.priceMeasureUnitName,
      bid.divisible,
      bid.flowDirection,
      bid.curveType,
      bid.priceAmount
    );
  }
}
