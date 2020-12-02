/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Point} from './Point';
import * as uuidv4 from 'uuid/v4';

export class MV {
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
  ) {}

  public static postMVFromJSON(mv: MV): MV {
    return new MV(
      'mv_' + uuidv4(),
      mv.siteId,
      mv.objectAggregationMeteringPoint,
      mv.timeIntervalStart,
      mv.timeIntervalEnd,
      mv.resolution,
      mv.pointType,
      mv.timeZone,
      mv.timeSeries,
      mv.revisionNumber,
      mv.type,
      mv.docStatus,
      mv.processType,
      mv.classificationType,
      mv.senderMarketParticipantMRID,
      mv.senderMarketParticipantRole,
      mv.receiverMarketParticipantMRID,
      mv.receiverMarketParticipantMarketRoleType,
      mv.createdDateTime,
      mv.measurementUnitName,
      mv.areaDomain,
      mv.marketEvaluationPointMrid
    );
  }
}
