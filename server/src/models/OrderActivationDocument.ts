/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import * as uuidv4 from 'uuid/v4';

export class OrderActivationDocument {
  public constructor(
    public orderId: string,
    public nazaRegisteredResourceMrid: string,
    public orderAllValue: number,
    public createdDateTime: string,
    public objectAggregationMeteringPoint: string[],
    public a04RegisteredResourceMrid: string[],
    public measurementUnitName?: string,
    public revisionNumber?: string,
    public type?: string,
    public senderMarketParticipantMrid?: string,
    public receiverMarketParticipantMrid?: string,
    public receiverMarketParticipantMarketRoleType?: string
  ) {}

  public static createOrderActivationDocument(
    orderActivationDocument: OrderActivationDocument
  ): OrderActivationDocument {
    return new OrderActivationDocument(
      orderActivationDocument.orderId,
      orderActivationDocument.nazaRegisteredResourceMrid,
      orderActivationDocument.orderAllValue,
      orderActivationDocument.createdDateTime,
      orderActivationDocument.objectAggregationMeteringPoint,
      orderActivationDocument.a04RegisteredResourceMrid,
      orderActivationDocument.measurementUnitName,
      orderActivationDocument.revisionNumber,
      orderActivationDocument.type,
      orderActivationDocument.senderMarketParticipantMrid,
      orderActivationDocument.receiverMarketParticipantMrid,
      orderActivationDocument.receiverMarketParticipantMarketRoleType
    );
  }

  public static postOrderActivationDocumentFromJSON(
    orderActivationDocument: OrderActivationDocument
  ): OrderActivationDocument {
    return new OrderActivationDocument(
      'orderActivationDocument_' + uuidv4(),
      orderActivationDocument.nazaRegisteredResourceMrid,
      orderActivationDocument.orderAllValue,
      orderActivationDocument.createdDateTime,
      orderActivationDocument.objectAggregationMeteringPoint,
      orderActivationDocument.a04RegisteredResourceMrid,
      orderActivationDocument.measurementUnitName,
      orderActivationDocument.revisionNumber,
      orderActivationDocument.type,
      orderActivationDocument.senderMarketParticipantMrid,
      orderActivationDocument.receiverMarketParticipantMrid,
      orderActivationDocument.receiverMarketParticipantMarketRoleType
    );
  }
}
