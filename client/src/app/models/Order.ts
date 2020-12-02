/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export class Order {
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
}
