/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {AssetType} from '../../enums/AssetType';
import {Point} from '../point/Point';

export class Bid {
  public assetType: AssetType;

  public constructor(
    public bidId: string,
    public edaRegisteredResourceId: string,
    public edaRegisteredResourceMrid: string,
    public bidRegisteredResourceMrid: string,
    public timeIntervalStart: string,
    public timeIntervalEnd: string,
    public resolution: number,
    public pointType: string,
    public timeZone: string,
    public timeSeries: Point[],
    public type?: string,
    public processType?: string,
    public senderMarketParticipantMrid?: string,
    public senderMarketParticipantMarketRoleType?: string,
    public receiverMarketParticipantMrid?: string,
    public receiverMarketParticipantMarketRoleType?: string,
    public createdDateTime?: string,
    public domainMrid?: string,
    public subjectMarketParticipantMrid?: string,
    public subjectMarketParticipantMarketRoleType?: string,
    public businessType?: string,
    public acquiringDomainMrid?: string,
    public connectingDomainMrid?: string,
    public providerMarketParticipantMrid?: string,
    public quantityMeasureUnitName?: string,
    public currencyUnitName?: string,
    public priceMeasureUnitName?: string,
    public divisible?: string,
    public flowDirection?: string,
    public curveType?: string,
    public priceAmount?: string
  ) {
    this.assetType = AssetType.Bid;
  }
}
