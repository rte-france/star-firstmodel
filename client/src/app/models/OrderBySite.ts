/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export enum OrderValueRange {
  ALL = 0,
  NOTHING = 1
}

export class OrderBySite {
  public constructor(
    public idOrderBySite: string,
    public orderId: string,
    public siteId: string,
    public idExpectedLogOrder: string[],
    public orderValue: number,
    public createdDateTime: string,
    public timeZone: string
  ) {}
}
