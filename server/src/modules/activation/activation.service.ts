/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {FabricConnectorService} from '../fabric-connector/fabric-connector.service';
import {ChannelName} from '../../common/enum/ChannelName';
import {Log} from '../../common/utils/logging/Log';
import {Activation} from '../../models/Activation';
import {ActivationChaincodeMethod} from './enum/ActivationChaincodeMethod';

@Injectable()
export class ActivationService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async getActivations(): Promise<Activation[]> {
    try {
      Log.server.info(
        `[${ActivationService.name}] calling chaincode method [${ActivationChaincodeMethod.GetActivations}]`
      );

      return await this.fabricClient.query(
        ActivationChaincodeMethod.GetActivations,
        [],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${ActivationService.name}].${ActivationChaincodeMethod.GetActivations} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }
}
