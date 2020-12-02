/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {FabricConnectorService} from '../../fabric-connector/fabric-connector.service';
import {Log} from '../../../common/utils/logging/Log';
import {ChannelName} from '../../../common/enum/ChannelName';
import {TransactionResponse} from '../../fabric-connector/models/TransactionResponse';
import {IOrderBySiteActivationDocumentService} from './orderBySiteActivationDocument.service.interface';
import {OrderBySiteActivationDocumentChaincodeMethod} from './enum/OrderBySiteActivationDocumentChaincodeMethod';
import {OrderBySiteActivationDocument} from '../../../models/OrderBySiteActivationDocument';
import {OrderActivationDocumentChaincodeMethod} from '../orderActivationDocument/enum/OrderActivationDocumentChaincodeMethod';
import {OrderActivationDocumentDto} from '../orderActivationDocument/dto/OrderActivationDocumentDto';
import {OrderActivationDocument} from '../../../models/OrderActivationDocument';
import {LogOrder} from '../../../models/LogOrder';
import {UpdatedOrder} from './interface/updatedOrder.interface';
import * as uuidv4 from 'uuid/v4';
import {LogOrderType} from './enum/LogOrderType';

@Injectable()
export class OrderBySiteActivationDocumentService
  implements IOrderBySiteActivationDocumentService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async createOrderBySiteActivationDocument(
    orderBySiteActivationDocuments: OrderBySiteActivationDocument[]
  ): Promise<OrderBySiteActivationDocument[]> {
    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling chaincode method [${OrderBySiteActivationDocumentChaincodeMethod.CreateOrderBySiteActivationDocument}]`
      );

      this.createOrderBySiteActivationDocumentObject(
        orderBySiteActivationDocuments
      );

      const invokeResult: TransactionResponse = await this.fabricClient.invoke(
        OrderBySiteActivationDocumentChaincodeMethod.CreateOrderBySiteActivationDocument,
        [orderBySiteActivationDocuments],
        ChannelName.StarNetwork
      );
      if (invokeResult.status === 'SUCCESS') {
        return orderBySiteActivationDocuments;
      }
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}].${OrderActivationDocumentChaincodeMethod.CreateOrderActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateOrderActivationDocumentEnd(
    orderActivationDocument: OrderActivationDocumentDto,
    orderId: string
  ): Promise<UpdatedOrder> {
    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling chaincode method [${OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument}]`
      );

      const invokeResult: TransactionResponse = await this.fabricClient.invoke(
        OrderActivationDocumentChaincodeMethod.CreateOrderActivationDocument,
        [orderActivationDocument],
        ChannelName.StarNetworkOrder
      );

      if (invokeResult.status === 'SUCCESS') {
        const createdOrderActivationDocument: OrderActivationDocument = OrderActivationDocument.createOrderActivationDocument(
          orderActivationDocument
        );
        const orderBySiteActivationDocumentQuery: OrderBySiteActivationDocument = OrderBySiteActivationDocument.queryMapOrderBySiteActivationDocument(
          null,
          orderId,
          null,
          null,
          null,
          null
        );
        const updatedOrderBySiteActivationDocuments: any = await this.queryOrderBySiteActivationDocument(
          orderBySiteActivationDocumentQuery
        );

        for (let orderBySite of updatedOrderBySiteActivationDocuments) {
          orderBySite = OrderBySiteActivationDocument.updateWithEndOrder(
            orderActivationDocument,
            orderBySite
          );
        }

        return {
          orderActivationDocument: createdOrderActivationDocument,
          orderBySiteActivationDocumentList: await this.endOrderBySiteActivationDocument(
            updatedOrderBySiteActivationDocuments
          )
        } as UpdatedOrder;
      }
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}].${OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async queryOrderBySiteActivationDocument(
    query: any
  ): Promise<OrderBySiteActivationDocument[]> {
    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling chaincode method [${OrderBySiteActivationDocumentChaincodeMethod.QueryOrderBySiteActivationDocument}]`
      );

      return await this.fabricClient.query(
        OrderBySiteActivationDocumentChaincodeMethod.QueryOrderBySiteActivationDocument,
        [JSON.stringify(query)],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}].${OrderBySiteActivationDocumentChaincodeMethod.QueryOrderBySiteActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getAllOrderBySiteActivationDocuments(): Promise<
    OrderBySiteActivationDocument[]
  > {
    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling chaincode method [${OrderBySiteActivationDocumentChaincodeMethod.GetAllOrderBySiteActivationDocuments}]`
      );

      return await this.fabricClient.query(
        OrderBySiteActivationDocumentChaincodeMethod.GetAllOrderBySiteActivationDocuments,
        [],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}].${OrderBySiteActivationDocumentChaincodeMethod.GetAllOrderBySiteActivationDocuments} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getOrderBySiteActivationDocumentById(
    id: string
  ): Promise<OrderBySiteActivationDocument> {
    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling chaincode method [${OrderBySiteActivationDocumentChaincodeMethod.GetOrderBySiteActivationDocumentById}]`
      );

      return await this.fabricClient.query(
        OrderBySiteActivationDocumentChaincodeMethod.GetOrderBySiteActivationDocumentById,
        [id],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}].${OrderBySiteActivationDocumentChaincodeMethod.GetOrderBySiteActivationDocumentById} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateOrderBySiteActivationDocument(
    updatedOrderBySiteActivationDocument: OrderBySiteActivationDocument,
    id: string
  ): Promise<TransactionResponse> {
    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling chaincode method [${OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument}]`
      );

      const orderBySite: OrderBySiteActivationDocument = OrderBySiteActivationDocument.createOrderBySiteActivationDocument(
        updatedOrderBySiteActivationDocument
      );
      orderBySite.idOrderBySite = id;

      return await this.fabricClient.invoke(
        OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument,
        [orderBySite],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}].${OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateOrderBySiteActivationDocumentWithLogOrder(
    logOrder: LogOrder,
    orderBySiteActivationDocumentId: string
  ): Promise<TransactionResponse> {
    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling [updateOrderBySiteActivationDocumentWithLogOrder]`
      );
      const logOrderUpdated: LogOrder = LogOrder.createLogOrder(logOrder);
      const orderBySite: OrderBySiteActivationDocument = await this.updateWithLogOrder(
        orderBySiteActivationDocumentId,
        logOrderUpdated
      );

      return await this.fabricClient.invoke(
        OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument,
        [orderBySite],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}] updateOrderBySiteActivationDocumentWithLogOrder failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async endOrderBySiteActivationDocument(
    orderBySiteActivationDocuments: OrderBySiteActivationDocument[]
  ): Promise<OrderBySiteActivationDocument[]> {
    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling chaincode method [${OrderBySiteActivationDocumentChaincodeMethod.UpdateBulkOrderBySiteActivationDocument}]`
      );

      const transactionResponse: TransactionResponse = await this.fabricClient.invoke(
        OrderBySiteActivationDocumentChaincodeMethod.UpdateBulkOrderBySiteActivationDocument,
        [orderBySiteActivationDocuments],
        ChannelName.StarNetwork
      );

      if (transactionResponse.status === 'SUCCESS') {
        return orderBySiteActivationDocuments;
      }
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}].${OrderBySiteActivationDocumentChaincodeMethod.UpdateBulkOrderBySiteActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateWithLogOrder(
    orderBySiteActivationDocumentId: string,
    logOrder: LogOrder
  ): Promise<OrderBySiteActivationDocument> {
    const queryResult: OrderBySiteActivationDocument = await this.fabricClient.query(
      OrderBySiteActivationDocumentChaincodeMethod.GetOrderBySiteActivationDocumentById,
      [orderBySiteActivationDocumentId],
      ChannelName.StarNetwork
    );
    const orderBySiteActivationDocument: OrderBySiteActivationDocument = OrderBySiteActivationDocument.createOrderBySiteActivationDocument(
      queryResult
    );

    const index = orderBySiteActivationDocument.logOrder.findIndex(
      (log: LogOrder) => log.type === logOrder.type
    );
    if (index !== -1) {
      if (logOrder.type !== LogOrderType.ACTIVATION) {
        logOrder.logOrderTimestamp =
          orderBySiteActivationDocument.logOrder[index].logOrderTimestamp;
      }

      logOrder.idLogOrdre =
        orderBySiteActivationDocument.logOrder[index].idLogOrdre;
      orderBySiteActivationDocument.logOrder[index] = logOrder;
    }

    try {
      Log.server.info(
        `[${OrderBySiteActivationDocumentService.name}] calling chaincode method [${OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument}]`
      );

      const transactionResponse: TransactionResponse = await this.fabricClient.invoke(
        OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument,
        [orderBySiteActivationDocument],
        ChannelName.StarNetwork
      );

      if (transactionResponse.status === 'SUCCESS') {
        return orderBySiteActivationDocument;
      }
    } catch (error) {
      Log.server.error(
        `[${OrderBySiteActivationDocumentService.name}].${OrderBySiteActivationDocumentChaincodeMethod.UpdateOrderBySiteActivationDocument} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  private createOrderBySiteActivationDocumentObject(
    orderBySiteActivationDocuments: OrderBySiteActivationDocument[]
  ): void {
    for (const orderBySiteActivationDocument of orderBySiteActivationDocuments) {
      orderBySiteActivationDocument.idOrderBySite =
        'orderBySiteActivationDocument_' + uuidv4();
    }
  }
}
