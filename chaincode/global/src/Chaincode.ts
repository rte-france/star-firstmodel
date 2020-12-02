/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ChaincodeResponse, ChaincodeStub, Shim} from 'fabric-shim';
import * as util from 'util';
import {PowerPlanEnergyScheduleController} from './powerPlanEnergySchedule/PowerPlanEnergyScheduleController';
import {EDAController} from './eda/EDAController';
import {EDPController} from './edp/EDPController';
import {MethodComponent} from '../enums/MethodComponent';
import {Log} from '../logger/Log';
import {BidController} from './bid/BidController';
import {MVController} from './MV/MVController';
import {HVController} from './HV/HVController';
import {LogOrderController} from './logOrder/LogOrderController';
import {OrderBySiteActivationDocumentController} from './orderBySiteActivationDocument/OrderBySiteActivationDocumentController';
import {SiteController} from './site/SiteController';
import {IController} from '../interfaces/IController';
import {Controller} from '../enums/Controller';
import {IOrganization} from '../interfaces/IOrganization';
import {ActivationController} from './activation/ActivationController';

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
    >([
      [
        Controller.PowerPlanEnergySchedule,
        new PowerPlanEnergyScheduleController(stub)
      ],
      [Controller.EDA, new EDAController(stub)],
      [Controller.EDP, new EDPController(stub)],
      [Controller.MV, new MVController(stub)],
      [Controller.HV, new HVController(stub)],
      [Controller.LogOrder, new LogOrderController(stub)],
      [Controller.Bid, new BidController(stub)],
      [Controller.Site, new SiteController(stub)],
      [
        Controller.OrderBySite,
        new OrderBySiteActivationDocumentController(stub)
      ],
      [Controller.Activation, new ActivationController(stub)]
    ]);

    if (controllers.has(Controller[controller])) {
      return controllers.get(Controller[controller]) as IController;
    } else {
      throw new Error(`No known controller for transaction ${stub.getTxID()}`);
    }
  }
}
