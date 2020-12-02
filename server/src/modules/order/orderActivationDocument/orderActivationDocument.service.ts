/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {FabricConnectorService} from '../../fabric-connector/fabric-connector.service';
import {Log} from '../../../common/utils/logging/Log';
import {ChannelName} from '../../../common/enum/ChannelName';
import {IOrderActivationDocumentService} from './orderActivationDocument.service.interface';
import {OrderActivationDocumentDto} from './dto/OrderActivationDocumentDto';
import {OrderActivationDocument} from '../../../models/OrderActivationDocument';
import {TransactionResponse} from '../../fabric-connector/models/TransactionResponse';
import {SiteService} from '../../site/site.service';
import {Site} from '../../../models/Site';
import {OrderBySiteActivationDocumentService} from '../orderBySiteActivationDocument/orderBySiteActivationDocument.service';
import {OrderActivationDocumentChaincodeMethod} from './enum/OrderActivationDocumentChaincodeMethod';
import {OrderBySiteActivationDocument} from '../../../models/OrderBySiteActivationDocument';

@Injectable()
export class OrderActivationDocumentService
  implements IOrderActivationDocumentService {
  public constructor(
    public fabricClient: FabricConnectorService,
    public siteService: SiteService,
    public orderBySiteActivationDocumentService: OrderBySiteActivationDocumentService
  ) {}

  public async createOrderActivationDocument(
    orderActivationDocument: OrderActivationDocument
  ): Promise<any> {
    try {
      Log.server.info(
        `[${OrderActivationDocumentService.name}] calling chaincode method [${OrderActivationDocumentChaincodeMethod.CreateOrderActivationDocument}]`
      );

      const invokeResult: TransactionResponse = await this.fabricClient.invoke(
        OrderActivationDocumentChaincodeMethod.CreateOrderActivationDocument,
        [orderActivationDocument],
        ChannelName.StarNetworkOrder
      );
      if (invokeResult.status === 'SUCCESS') {
        const querySiteResult: Site[] = await this.siteService.querySite({
          nazaRegisteredResourceMrid:
            orderActivationDocument.nazaRegisteredResourceMrid
        });

        orderActivationDocument.a04RegisteredResourceMrid = this.seta04RegisteredResourceMridOnOrderActivationDocument(
          querySiteResult
        );
        const createdOrderActivationDocument: OrderActivationDocument = OrderActivationDocument.createOrderActivationDocument(
          orderActivationDocument
        );

        if (querySiteResult) {
          const orderBySiteActivationDocumentList: OrderBySiteActivationDocument[] = OrderBySiteActivationDocument.createArray(
            createdOrderActivationDocument,
            querySiteResult
          );

          return {
            orderActivationDocument: createdOrderActivationDocument,
            orderBySiteActivationDocument: await this.orderBySiteActivationDocumentService.createOrderBySiteActivationDocument(
              orderBySiteActivationDocumentList
            )
          };
        }
      }
    } catch (error) {
      Log.server.error(
        `[${OrderActivationDocumentService.name}].${OrderActivationDocumentChaincodeMethod.CreateOrderActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateOrderActivationDocument(
    orderActivationDocument: OrderActivationDocumentDto,
    id: string
  ): Promise<OrderActivationDocumentDto> {
    try {
      Log.server.info(
        `[${OrderActivationDocumentService.name}] calling chaincode method [${OrderActivationDocumentChaincodeMethod.UpdateOrderActivationDocument}]`
      );

      const querySiteResult: Site[] = await this.siteService.querySite({
        nazaRegisteredResourceMrid:
          orderActivationDocument.nazaRegisteredResourceMrid
      });

      orderActivationDocument.a04RegisteredResourceMrid = this.seta04RegisteredResourceMridOnOrderActivationDocument(
        querySiteResult
      );
      const updatedOrderActivationDocument: OrderActivationDocument = OrderActivationDocument.createOrderActivationDocument(
        orderActivationDocument
      );
      updatedOrderActivationDocument.orderId = id;

      const invokeResult: TransactionResponse = await this.fabricClient.invoke(
        OrderActivationDocumentChaincodeMethod.UpdateOrderActivationDocument,
        [updatedOrderActivationDocument],
        ChannelName.StarNetworkOrder
      );

      if (invokeResult.status === 'SUCCESS') {
        return updatedOrderActivationDocument;
      }
    } catch (error) {
      Log.server.error(
        `[${OrderActivationDocumentService.name}].${OrderActivationDocumentChaincodeMethod.UpdateOrderActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getOrderActivationDocumentById(
    id: string
  ): Promise<OrderActivationDocumentDto> {
    try {
      Log.server.info(
        `[${OrderActivationDocumentService.name}] calling chaincode method [${OrderActivationDocumentChaincodeMethod.GetOrderActivationDocumentById}]`
      );

      return await this.fabricClient.query(
        OrderActivationDocumentChaincodeMethod.GetOrderActivationDocumentById,
        [id],
        ChannelName.StarNetworkOrder
      );
    } catch (error) {
      Log.server.error(
        `[${OrderActivationDocumentService.name}].${OrderActivationDocumentChaincodeMethod.UpdateOrderActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async queryOrderActivationDocument(
    query: any
  ): Promise<OrderActivationDocumentDto[]> {
    try {
      Log.server.info(
        `[${OrderActivationDocumentService.name}] calling chaincode method [${OrderActivationDocumentChaincodeMethod.QueryOrderActivationDocument}]`
      );

      return await this.fabricClient.query(
        OrderActivationDocumentChaincodeMethod.QueryOrderActivationDocument,
        [JSON.stringify(query)],
        ChannelName.StarNetworkOrder
      );
    } catch (error) {
      Log.server.error(
        `[${OrderActivationDocumentService.name}].${OrderActivationDocumentChaincodeMethod.QueryOrderActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getAllOrderActivationDocuments(): Promise<
    OrderActivationDocumentDto[]
  > {
    try {
      Log.server.info(
        `[${OrderActivationDocumentService.name}] calling chaincode method [${OrderActivationDocumentChaincodeMethod.GetAllOrderActivationDocuments}]`
      );

      return await this.fabricClient.query(
        OrderActivationDocumentChaincodeMethod.GetAllOrderActivationDocuments,
        [],
        ChannelName.StarNetworkOrder
      );
    } catch (error) {
      Log.server.error(
        `[${OrderActivationDocumentService.name}].${OrderActivationDocumentChaincodeMethod.GetAllOrderActivationDocuments} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  private seta04RegisteredResourceMridOnOrderActivationDocument(
    sites: Site[]
  ): string[] {
    const a04RegisteredResourceMrid: string[] = [];

    for (const site of sites) {
      if (
        !a04RegisteredResourceMrid.find(
          (id) => id === site.a04RegisteredResourceMrid
        )
      ) {
        a04RegisteredResourceMrid.push(site.a04RegisteredResourceMrid);
      }
    }

    return a04RegisteredResourceMrid;
  }
}
