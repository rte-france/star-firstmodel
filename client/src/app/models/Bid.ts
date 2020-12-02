/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Point} from './Point';

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
    public timeStamp?: string
  ) {}
}
