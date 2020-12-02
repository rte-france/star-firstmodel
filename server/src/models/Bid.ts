/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Point} from './Point';
import * as uuidv4 from 'uuid/v4';

export class Bid {
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
    public timeStamp?: string,
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
  ) {}

  public static postBidFromJSON(bid: Bid): Bid {
    return new Bid(
      `bid_${uuidv4()}`,
      bid.edaRegisteredResourceId,
      bid.edaRegisteredResourceMrid,
      bid.bidRegisteredResourceMrid,
      bid.timeIntervalStart,
      bid.timeIntervalEnd,
      bid.resolution,
      bid.pointType,
      bid.timeZone,
      bid.timeSeries,
      bid.timeStamp,
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
