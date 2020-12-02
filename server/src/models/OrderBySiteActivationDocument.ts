/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import * as uuidv4 from 'uuid/v4';
import {LogOrder} from './LogOrder';
import {OrderActivationDocument} from './OrderActivationDocument';
import {Site} from './Site';
import {LogOrderType} from '../modules/order/orderBySiteActivationDocument/enum/LogOrderType';

export class OrderBySiteActivationDocument {
  public constructor(
    public idOrderBySite: string,
    public orderId: string,
    public siteId: string,
    public logOrder: LogOrder[],
    public orderValue: number,
    public createdDateTime: string,
    public timeZone: string,
    public measurementUnitName?: string,
    public revisionNumber?: string,
    public type?: string,
    public senderMarketParticipantMrid?: string,
    public receiverMarketParticipantMrid?: string,
    public receiverMarketParticipantMarketRoleType?: string
  ) {}

  public static createOrderBySiteActivationDocument(
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

  public static postOrderBySiteActivationDocumentFromOrder(
    orderActivationDocument: OrderActivationDocument,
    siteId: string
  ): OrderBySiteActivationDocument {
    return new OrderBySiteActivationDocument(
      `orderBySiteActivationDocument_${uuidv4()}`,
      orderActivationDocument.orderId,
      siteId,
      [],
      orderActivationDocument.orderAllValue,
      orderActivationDocument.createdDateTime,
      'CET',
      orderActivationDocument.measurementUnitName,
      orderActivationDocument.revisionNumber,
      orderActivationDocument.type,
      orderActivationDocument.senderMarketParticipantMrid,
      orderActivationDocument.receiverMarketParticipantMrid,
      orderActivationDocument.receiverMarketParticipantMarketRoleType
    );
  }

  public static queryMapOrderBySiteActivationDocument(
    idOrderBySite: string,
    orderId: string,
    siteId: string,
    orderValue: number,
    timeStamp: string,
    timeZone: string
  ): OrderBySiteActivationDocument {
    const map: OrderBySiteActivationDocument = new OrderBySiteActivationDocument(
      null,
      null,
      null,
      null,
      null,
      null,
      null
    );

    if (idOrderBySite) {
      map.idOrderBySite = idOrderBySite;
    }

    if (orderId) {
      map.orderId = orderId;
    }

    if (siteId) {
      map.siteId = siteId;
    }

    if (orderValue) {
      map.orderValue = orderValue;
    }

    if (timeStamp) {
      map.createdDateTime = timeStamp;
    }

    if (timeZone) {
      map.timeZone = timeZone;
    }

    return map;
  }

  public static updateWithEndOrder(
    orderActivationDocument: OrderActivationDocument,
    orderBySiteActivationDocument: OrderBySiteActivationDocument
  ): OrderBySiteActivationDocument {
    const endLogOrderIndex = orderBySiteActivationDocument.logOrder.findIndex(
      (logOrder) => logOrder.type === LogOrderType.END
    );

    if (endLogOrderIndex !== -1) {
      orderBySiteActivationDocument.logOrder[endLogOrderIndex] = new LogOrder(
        'log-order_' + uuidv4(),
        '',
        LogOrderType.END,
        true,
        orderActivationDocument.createdDateTime
      );
    } else {
      orderBySiteActivationDocument.logOrder.push(
        new LogOrder(
          'log-order_' + uuidv4(),
          '',
          LogOrderType.END,
          true,
          orderActivationDocument.createdDateTime
        )
      );
    }

    return orderBySiteActivationDocument;
  }

  public static createArray(
    orderActivationDocument: OrderActivationDocument,
    sites: Site[]
  ): OrderBySiteActivationDocument[] {
    const orderBySiteActivationDocuments: OrderBySiteActivationDocument[] = [];

    for (const site of sites) {
      const logOrderArray: LogOrder[] = [
        new LogOrder(
          'log-order_' + uuidv4(),
          '',
          LogOrderType.RECEPTION,
          true,
          orderActivationDocument.createdDateTime
        ),
        new LogOrder(
          'log-order_' + uuidv4(),
          '',
          LogOrderType.ACTIVATION,
          true,
          orderActivationDocument.createdDateTime
        )
      ];
      orderBySiteActivationDocuments.push(
        new OrderBySiteActivationDocument(
          `orderBySiteActivationDocument_${uuidv4()}`,
          orderActivationDocument.orderId,
          site.siteId,
          logOrderArray,
          orderActivationDocument.orderAllValue,
          orderActivationDocument.createdDateTime,
          'CET'
        )
      );
    }

    return orderBySiteActivationDocuments;
  }
}
