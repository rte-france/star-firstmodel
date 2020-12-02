/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export class Point {
  public constructor(
    public idPoint: string,
    public quantity: string,
    public timeStampStart: string,
    public timeStampEnd: string
  ) {}
}
