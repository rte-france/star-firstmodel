/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export interface LogOrder {
  idLogOrdre: string;
  nazaRegisteredResourceMrid: string;
  orderAllValue: number;
  timeStamp: string;
  objectAggregationMeteringPoint: string[];
  creator: string;
}

export class LogOrder {
  public constructor(
    public idLogOrdre: string,
    public message: string,
    public type: string,
    public success: boolean,
    public logOrderTimestamp: string,
    public creator: string = undefined
  ) {}
}
