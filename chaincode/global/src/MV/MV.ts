/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {AssetType} from '../../enums/AssetType';
import {Point} from '../point/Point';

export class MV {
  public assetType: AssetType;

  public constructor(
    public energyAccountMarketDocumentMrid: string,
    public siteId: string,
    public objectAggregationMeteringPoint: string,
    public timeIntervalStart: string,
    public timeIntervalEnd: string,
    public resolution: number,
    public pointType: string,
    public timeZone: string,
    public timeSeries: Point[],
    public revisionNumber?: number,
    public type?: string,
    public docStatus?: string,
    public processType?: string,
    public classificationType?: string,
    public senderMarketParticipantMRID?: string,
    public senderMarketParticipantRole?: string,
    public receiverMarketParticipantMRID?: string,
    public receiverMarketParticipantMarketRoleType?: string,
    public createdDateTime?: string,
    public measurementUnitName?: string,
    public areaDomain?: string,
    public marketEvaluationPointMrid?: string
  ) {
    this.assetType = AssetType.MV;
  }
}
