/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeStub} from 'fabric-shim';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {LogOrder} from './LogOrder';

export class LogOrderController implements IController {
  private state: State;

  public constructor(private stub: ChaincodeStub) {
    this.state = new State(this.stub);
  }

  public async createLogOrder(logOrder: LogOrder): Promise<LogOrder> {
    if (await new State(this.stub).isAssetRegistered(logOrder.idLogOrdre)) {
      throw new Error(`${logOrder.idLogOrdre} already exists.`);
    }

    await new State(this.stub).put<LogOrder>(
      logOrder.idLogOrdre,
      this.createLogOrderAssetForBlockChain(logOrder)
    );

    return logOrder;
  }

  private createLogOrderAssetForBlockChain(logOrder: LogOrder): LogOrder {
    return new LogOrder(
      logOrder.idLogOrdre,
      logOrder.message,
      logOrder.type,
      logOrder.success,
      logOrder.logOrderTimestamp,
      this.stub.getCreator().getMspid()
    );
  }
}
