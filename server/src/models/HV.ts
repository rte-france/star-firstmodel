/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Point} from './Point';
import * as uuidv4 from 'uuid/v4';

export class HV {
  public constructor(
    public energyAccountMarketDocumentMrid: string,
    public siteId: string,
    public ppeSiteCode: string,
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

  public static postHVFromJSON(hv: HV): HV {
    return new HV(
      'hv_' + uuidv4(),
      hv.siteId,
      hv.ppeSiteCode,
      hv.timeIntervalStart,
      hv.timeIntervalEnd,
      hv.resolution,
      hv.pointType,
      hv.timeZone,
      hv.timeSeries,
      hv.revisionNumber,
      hv.type,
      hv.docStatus,
      hv.processType,
      hv.classificationType,
      hv.senderMarketParticipantMRID,
      hv.senderMarketParticipantRole,
      hv.receiverMarketParticipantMRID,
      hv.receiverMarketParticipantMarketRoleType,
      hv.createdDateTime,
      hv.measurementUnitName,
      hv.areaDomain,
      hv.marketEvaluationPointMrid
    );
  }
}
