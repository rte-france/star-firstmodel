/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import * as uuidv4 from 'uuid/v4';

export class LogOrder {
  public constructor(
    public idLogOrdre: string,
    public message: string,
    public type: string,
    public success: boolean,
    public logOrderTimestamp: string
  ) {}

  public static createLogOrder(logOrder: LogOrder): LogOrder {
    return new LogOrder(
      logOrder.idLogOrdre,
      logOrder.message,
      logOrder.type,
      logOrder.success,
      logOrder.logOrderTimestamp
    );
  }

  public static postLogOrderFromJSON(logOrder: LogOrder): LogOrder {
    return new LogOrder(
      'log-order_' + uuidv4(),
      logOrder.message,
      logOrder.type,
      logOrder.success,
      logOrder.logOrderTimestamp
    );
  }
}
