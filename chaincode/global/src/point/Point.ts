/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export interface Point {
  idPoint: string;
  quantity: string;
  timeStampStart: string;
  timeStampEnd: string;
}

export class Point {
  public constructor(
    public idPoint: string,
    public quantity: string,
    public timeStampStart: string,
    public timeStampEnd: string
  ) {}

  public static createPoint(point: Point): Point {
    return new Point(
      point.idPoint,
      point.quantity,
      point.timeStampStart,
      point.timeStampEnd
    );
  }
}
