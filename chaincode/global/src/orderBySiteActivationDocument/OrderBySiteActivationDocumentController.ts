/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {Log} from '../../logger/Log';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {AssetType} from '../../enums/AssetType';
import {OrderBySiteActivationDocument} from './OrderBySiteActivationDocument';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {AssetError} from '../common/AssetError';
import {SiteType} from '../site/enums/SiteType';
import {Site} from '../site/Site';
import {SiteController} from '../site/SiteController';
import {IOrganization} from '../../interfaces/IOrganization';
import {Transaction} from '../Transaction';
import {EDA} from '../eda/EDA';
import {LogOrder} from '../logOrder/LogOrder';

export class OrderBySiteActivationDocumentController extends Transaction
  implements IController {
  private siteController: SiteController;

  public constructor(readonly stub: ChaincodeStub) {
    super(stub);

    this.siteController = new SiteController(stub);
  }

  public async createOrderBySiteActivationDocument(
    orderBySiteActivationDocumentList: OrderBySiteActivationDocument[],
    organization: IOrganization
  ): Promise<OrderBySiteActivationDocument[]> {
    Log.chaincode.info('====== Create OrderBySite ======');

    await this.throwErrorIfOrganizationTypeIsNotAllowedToCreateOrderBySiteActivationDocument(
      orderBySiteActivationDocumentList
    );

    if (this.isOrganizationType(OrganizationTypeMsp.DSO)) {
      await this.throwErrorIfOrganizationIsNotAllowedToCreateOrderBySiteActivationDocuments(
        orderBySiteActivationDocumentList,
        organization
      );
    }

    const orderBySiteActivationDocumentIdList: string[] = [];
    const orderBySiteActivationDocumentBlockchainList: OrderBySiteActivationDocument[] = [];
    for (const orderBySiteActivationDocument of orderBySiteActivationDocumentList) {
      if (
        await new State(this.stub).isAssetRegistered(
          orderBySiteActivationDocument.idOrderBySite
        )
      ) {
        throw new Error(
          `${orderBySiteActivationDocument.idOrderBySite} already exists.`
        );
      } else {
        orderBySiteActivationDocumentIdList.push(
          orderBySiteActivationDocument.idOrderBySite
        );

        this.setInitialCreatorOfLogOrders(
          orderBySiteActivationDocument.logOrder,
          organization.organizationId
        );
        orderBySiteActivationDocumentBlockchainList.push(
          this.createOrderBySiteAssetForBlockChain(
            orderBySiteActivationDocument
          )
        );
      }
    }
    await new State(this.stub).bulkPut<OrderBySiteActivationDocument>(
      orderBySiteActivationDocumentIdList,
      orderBySiteActivationDocumentBlockchainList
    );

    return orderBySiteActivationDocumentList;
  }

  public async updateBulkOrderBySiteActivationDocument(
    orderBySiteActivationDocumentList: OrderBySiteActivationDocument[]
  ): Promise<OrderBySiteActivationDocument[]> {
    Log.chaincode.info('====== update OrderBySite ======');
    const orderBySiteActivationDocumentIdList: string[] = [];
    const orderBySiteActivationDocumentBlockchainList: OrderBySiteActivationDocument[] = [];
    for (const orderBySite of orderBySiteActivationDocumentList) {
      if (
        !(await new State(this.stub).isAssetRegistered(
          orderBySite.idOrderBySite
        ))
      ) {
        throw new Error(`${orderBySite.idOrderBySite} doesn't exist.`);
      } else {
        orderBySiteActivationDocumentIdList.push(orderBySite.idOrderBySite);
        orderBySiteActivationDocumentBlockchainList.push(
          this.createOrderBySiteAssetForBlockChain(orderBySite)
        );
      }
    }
    await new State(this.stub).bulkPut<OrderBySiteActivationDocument>(
      orderBySiteActivationDocumentIdList,
      orderBySiteActivationDocumentBlockchainList
    );

    return orderBySiteActivationDocumentList;
  }

  public async updateOrderBySiteActivationDocument(
    orderBySiteActivationDocument: OrderBySiteActivationDocument,
    organization: IOrganization
  ): Promise<OrderBySiteActivationDocument> {
    await this.throwErrorIfOrganizationTypeIsNotAllowedToUpdateOrderBySiteActivationDocument(
      orderBySiteActivationDocument
    );

    if (
      this.isOrganizationType(OrganizationTypeMsp.DSO) &&
      !(await this.hasDSOOrganizationPermission(
        orderBySiteActivationDocument,
        organization
      ))
    ) {
      throw new AssetError(
        orderBySiteActivationDocument.siteId,
        this.constructor.name,
        `Organization does not have the permission to update ${orderBySiteActivationDocument.idOrderBySite}.`
      );
    }

    if (
      this.isOrganizationType(OrganizationTypeMsp.BSP) &&
      !(await this.hasBSPOrganizationPermission(
        orderBySiteActivationDocument,
        organization
      ))
    ) {
      throw new AssetError(
        orderBySiteActivationDocument.idOrderBySite,
        this.constructor.name,
        `Organization does not have the permission to update ${orderBySiteActivationDocument.idOrderBySite}.`
      );
    }

    if (
      this.isOrganizationType(OrganizationTypeMsp.PRODUCER) &&
      !(await this.hasPRODUCEROrganizationPermission(
        orderBySiteActivationDocument,
        organization
      ))
    ) {
      throw new AssetError(
        orderBySiteActivationDocument.idOrderBySite,
        this.constructor.name,
        `Organization does not have the permission to update ${orderBySiteActivationDocument.idOrderBySite}.`
      );
    }

    if (orderBySiteActivationDocument.logOrder.length > 0) {
      this.updateCreatorOfLogOrder(
        orderBySiteActivationDocument.logOrder,
        organization.organizationId
      );
    }

    await new State(this.stub).update<OrderBySiteActivationDocument>(
      orderBySiteActivationDocument.idOrderBySite,
      this.createOrderBySiteAssetForBlockChain(orderBySiteActivationDocument)
    );

    return orderBySiteActivationDocument;
  }

  public async getOrderBySiteActivationDocumentById(
    id: string,
    organization: IOrganization
  ): Promise<OrderBySiteActivationDocument> {
    const orderBySiteActivationDocument: OrderBySiteActivationDocument = await new State(
      this.stub
    ).get<OrderBySiteActivationDocument>(id);

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      const retrievedOrderBySite: OrderBySiteActivationDocument[] = await this.returnAllOrderBySiteActivationDocumentsWithReferenceToOrganization(
        [orderBySiteActivationDocument],
        organization
      );

      if (retrievedOrderBySite.length === 0) {
        throw new AssetError(
          orderBySiteActivationDocument.idOrderBySite,
          this.constructor.name,
          `Organization is not allowed to get ${orderBySiteActivationDocument.idOrderBySite}`
        );
      }
    }

    return orderBySiteActivationDocument;
  }

  public async getAllOrderBySiteActivationDocuments(
    organization: IOrganization
  ): Promise<OrderBySiteActivationDocument[]> {
    const orderBySiteActivationDocuments: OrderBySiteActivationDocument[] = await new State(
      this.stub
    ).getAll<OrderBySiteActivationDocument>(
      AssetType.OrderBySiteActivationDocument
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllOrderBySiteActivationDocumentsWithReferenceToOrganization(
        orderBySiteActivationDocuments,
        organization
      );
    }

    return orderBySiteActivationDocuments;
  }

  public async queryOrderBySiteActivationDocument(
    mapQueryOrderBySiteActivationDocument: string,
    organization: IOrganization
  ): Promise<OrderBySiteActivationDocument[]> {
    const query = this.buildQuery(mapQueryOrderBySiteActivationDocument);

    const orderBySiteActivationDocuments: OrderBySiteActivationDocument[] = await new State(
      this.stub
    ).getByQuery<OrderBySiteActivationDocument>(
      AssetType.OrderBySiteActivationDocument,
      query
    );

    if (!this.isOrganizationType(OrganizationTypeMsp.TSO)) {
      return await this.returnAllOrderBySiteActivationDocumentsWithReferenceToOrganization(
        orderBySiteActivationDocuments,
        organization
      );
    }

    return orderBySiteActivationDocuments;
  }

  private async throwErrorIfOrganizationTypeIsNotAllowedToCreateOrderBySiteActivationDocument(
    orderBySiteActivationDocuments: OrderBySiteActivationDocument[]
  ): Promise<void> {
    const ids: string[] = orderBySiteActivationDocuments.map(
      (orderBySiteList) => {
        return orderBySiteList.siteId;
      }
    );

    let isNotAllowed = {
      status: false,
      siteId: ''
    };
    for (const siteId of ids) {
      const site: Site = await new State(this.stub).get<Site>(siteId);

      if (this.isOrganizationType(OrganizationTypeMsp.TSO)) {
        continue;
      } else if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        site.voltageType === SiteType.MV
      ) {
        continue;
      }

      isNotAllowed.status = true;
      isNotAllowed.siteId = siteId;
    }

    if (!isNotAllowed.status) {
      return;
    }

    if (
      this.isOrganizationType(OrganizationTypeMsp.TSO) ||
      this.isOrganizationType(OrganizationTypeMsp.DSO)
    ) {
      throw new AssetError(
        orderBySiteActivationDocuments[0].idOrderBySite,
        this.constructor.name,
        `OrganizationType is not allowed to create orderBySiteActivationDocuments for the type of ${isNotAllowed.siteId} in orderBySiteActivationDocuments.`
      );
    }

    throw new AssetError(
      orderBySiteActivationDocuments[0].idOrderBySite,
      this.constructor.name,
      'OrganizationType is not allowed to create orderBySiteActivationDocuments.'
    );
  }

  private async returnAllOrderBySiteActivationDocumentsWithReferenceToOrganization(
    orderBySiteActivationDocuments: OrderBySiteActivationDocument[],
    organization: IOrganization
  ): Promise<OrderBySiteActivationDocument[]> {
    const orderBySiteActivationDocumentsWithReferenceToOrganization: OrderBySiteActivationDocument[] = [];
    for (const orderBySiteActivationDocument of orderBySiteActivationDocuments) {
      if (
        this.isOrganizationType(OrganizationTypeMsp.DSO) &&
        (await this.hasDSOOrganizationPermission(
          orderBySiteActivationDocument,
          organization
        ))
      ) {
        orderBySiteActivationDocumentsWithReferenceToOrganization.push(
          orderBySiteActivationDocument
        );
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.BSP) &&
        (await this.hasBSPOrganizationPermission(
          orderBySiteActivationDocument,
          organization
        ))
      ) {
        orderBySiteActivationDocumentsWithReferenceToOrganization.push(
          orderBySiteActivationDocument
        );
      }

      if (
        this.isOrganizationType(OrganizationTypeMsp.PRODUCER) &&
        (await this.hasPRODUCEROrganizationPermission(
          orderBySiteActivationDocument,
          organization
        ))
      ) {
        orderBySiteActivationDocumentsWithReferenceToOrganization.push(
          orderBySiteActivationDocument
        );
      }
    }

    return orderBySiteActivationDocumentsWithReferenceToOrganization;
  }

  private async throwErrorIfOrganizationIsNotAllowedToCreateOrderBySiteActivationDocuments(
    orderBySiteActivationDocuments: OrderBySiteActivationDocument[],
    organization: IOrganization
  ): Promise<void> {
    for (const orderBySiteActivationDocument of orderBySiteActivationDocuments) {
      if (
        !(await this.hasDSOOrganizationPermission(
          orderBySiteActivationDocument,
          organization
        ))
      ) {
        throw new AssetError(
          orderBySiteActivationDocument.siteId,
          this.constructor.name,
          `Organization does not have the permission to create orderBySiteActivationDocument.`
        );
      }
    }
  }

  private async hasBSPOrganizationPermission(
    orderBySiteActivationDocument: OrderBySiteActivationDocument,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site = await this.getAssetById(
      orderBySiteActivationDocument.siteId
    );
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
    orderBySiteActivationDocument: OrderBySiteActivationDocument,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site = await this.getAssetById(
      orderBySiteActivationDocument.siteId
    );
    if (!site) {
      return false;
    }

    return site.a04RegisteredResourceMrid === organization.organizationId;
  }

  private async hasPRODUCEROrganizationPermission(
    orderBySiteActivationDocument: OrderBySiteActivationDocument,
    organization: IOrganization
  ): Promise<boolean> {
    const site: Site = await this.getAssetById(
      orderBySiteActivationDocument.siteId
    );
    if (!site) {
      return false;
    }

    return site.producerIEC === organization.organizationId;
  }

  private async throwErrorIfOrganizationTypeIsNotAllowedToUpdateOrderBySiteActivationDocument(
    orderBySiteActivationDocument: OrderBySiteActivationDocument
  ): Promise<void> {
    const site: Site = await new State(this.stub).get<Site>(
      orderBySiteActivationDocument.siteId
    );

    if (
      this.isOrganizationType(OrganizationTypeMsp.TSO) &&
      site.voltageType === SiteType.HV
    ) {
      return;
    } else if (
      this.isOrganizationType(OrganizationTypeMsp.DSO) &&
      site.voltageType === SiteType.MV
    ) {
      return;
    } else if (
      this.isOrganizationType(OrganizationTypeMsp.BSP) ||
      this.isOrganizationType(OrganizationTypeMsp.PRODUCER)
    ) {
      return;
    }

    if (
      this.isOrganizationType(OrganizationTypeMsp.TSO) ||
      this.isOrganizationType(OrganizationTypeMsp.DSO)
    ) {
      throw new AssetError(
        orderBySiteActivationDocument.idOrderBySite,
        this.constructor.name,
        `OrganizationType is not allowed to update orderBySiteActivationDocument for the type of ${orderBySiteActivationDocument.siteId}.`
      );
    }

    throw new AssetError(
      orderBySiteActivationDocument.idOrderBySite,
      this.constructor.name,
      'OrganizationType is not allowed to update orderBySiteActivationDocument.'
    );
  }

  private createOrderBySiteAssetForBlockChain(
    orderBySiteActivationDocument: OrderBySiteActivationDocument
  ): OrderBySiteActivationDocument {
    return new OrderBySiteActivationDocument(
      orderBySiteActivationDocument.idOrderBySite,
      orderBySiteActivationDocument.orderId,
      orderBySiteActivationDocument.siteId,
      orderBySiteActivationDocument.logOrder,
      orderBySiteActivationDocument.orderValue,
      orderBySiteActivationDocument.createdDateTime,
      orderBySiteActivationDocument.timeZone,
      orderBySiteActivationDocument.measurementUnitName,
      orderBySiteActivationDocument.revisionNumber,
      orderBySiteActivationDocument.type,
      orderBySiteActivationDocument.senderMarketParticipantMrid,
      orderBySiteActivationDocument.receiverMarketParticipantMrid,
      orderBySiteActivationDocument.receiverMarketParticipantMarketRoleType
    );
  }

  private setInitialCreatorOfLogOrders(
    logOrders: LogOrder[],
    organizationId: string
  ): void {
    for (const logOrder of logOrders) {
      logOrder.creator = organizationId;
    }
  }

  private updateCreatorOfLogOrder(
    logOrders: LogOrder[],
    organizationId: string
  ): void {
    const logOrderToUpdate = logOrders.reduce(
      (previousLogOrder: LogOrder, currentLogOrder: LogOrder) => {
        return previousLogOrder.logOrderTimestamp >
          currentLogOrder.logOrderTimestamp
          ? previousLogOrder
          : currentLogOrder;
      }
    );

    logOrderToUpdate.creator = organizationId;
  }

  private buildQuery(mapQuery: string): any {
    const orderBySiteActivationDocument: OrderBySiteActivationDocument = JSON.parse(
      mapQuery
    );

    return {
      idOrderBySite: orderBySiteActivationDocument.idOrderBySite
        ? {$eq: orderBySiteActivationDocument.idOrderBySite}
        : {$ne: null},
      orderId: orderBySiteActivationDocument.orderId
        ? {$eq: orderBySiteActivationDocument.orderId}
        : {$ne: null},
      orderValue: orderBySiteActivationDocument.orderValue
        ? {$eq: orderBySiteActivationDocument.orderValue}
        : {$ne: null},
      createdDateTime: orderBySiteActivationDocument.createdDateTime
        ? {$eq: orderBySiteActivationDocument.createdDateTime}
        : {$ne: null},
      timeZone: orderBySiteActivationDocument.timeZone
        ? {$eq: orderBySiteActivationDocument.timeZone}
        : {$ne: null}
    };
  }
}
