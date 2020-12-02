/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeResponse, ChaincodeStub, Shim} from 'fabric-shim';
import * as util from 'util';
import {MethodComponent} from '../enums/MethodComponent';
import {Log} from '../logger/Log';
import {IController} from '../interfaces/IController';
import {Controller} from '../enums/Controller';
import {OrderActivationDocumentController} from './orderActivationDocument/OrderActivationDocumentController';
import {IOrganization} from '../interfaces/IOrganization';

export class Chaincode {
  public async Init(stub: ChaincodeStub): Promise<ChaincodeResponse> {
    Log.chaincode.debug('========= Chaincode Init =========');
    Log.chaincode.debug('========= END : Initialize Ledger =========');

    return Shim.success();
  }

  public async Invoke(stub: ChaincodeStub): Promise<ChaincodeResponse> {
    Log.chaincode.debug(`Transaction ID: ${stub.getTxID()}`);
    Log.chaincode.debug(util.format('Args: %j', stub.getArgs()));

    const functionAndParameters = stub.getFunctionAndParameters();
    const controllerName: string = functionAndParameters.fcn.split('.')[
      MethodComponent.Controller
    ];
    const functionName: string = functionAndParameters.fcn.split('.')[
      MethodComponent.Function
    ];
    const params = JSON.parse(functionAndParameters.params[0]);
    const organization: IOrganization = JSON.parse(
      functionAndParameters.params[1]
    );

    let payload: any;

    try {
      const controller: IController = this.getController(stub, controllerName);

      if (typeof controller[functionName] !== 'function') {
        throw new Error(`No function named: ${functionAndParameters.fcn}`);
      }

      payload = await controller[functionName].apply(controller, [
        ...params,
        organization
      ]);

      if (!payload) {
        return Shim.success();
      }

      return Shim.success(Buffer.from(JSON.stringify(payload)));
    } catch (error) {
      Log.chaincode.error(error);

      return Shim.error(error);
    }
  }

  private getController(stub: ChaincodeStub, controller: string): IController {
    const controllers: Map<Controller, IController> = new Map<
      Controller,
      IController
    >([[Controller.Order, new OrderActivationDocumentController(stub)]]);

    if (controllers.has(Controller[controller])) {
      return controllers.get(Controller[controller]) as IController;
    } else {
      throw new Error(`No known controller for transaction ${stub.getTxID()}`);
    }
  }
}
