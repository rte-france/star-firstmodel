/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {AssetType} from '../../enums/AssetType';
import {LogOrder} from '../logOrder/LogOrder';

export class OrderBySiteActivationDocument {
  public assetType: AssetType;

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
  ) {
    this.assetType = AssetType.OrderBySiteActivationDocument;
  }
}
