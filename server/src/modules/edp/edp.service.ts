/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {IEDPService} from './edp.service.interface';
import {EDPDto} from './dto/EDPDto';
import {EDP} from '../../models/EDP';
import {EDPChaincodeMethod} from './enum/EDPChaincodeMethod';
import {Log} from '../../common/utils/logging/Log';
import {FabricConnectorService} from '../fabric-connector/fabric-connector.service';
import {ChannelName} from '../../common/enum/ChannelName';
import {TransactionResponse} from '../fabric-connector/models/TransactionResponse';

@Injectable()
export class EdpService implements IEDPService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async createEDP(edp: EDPDto): Promise<any> {
    try {
      Log.server.info(
        `[${EdpService.name}] calling chaincode method [${EDPChaincodeMethod.CreateEDP}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        EDPChaincodeMethod.CreateEDP,
        [edp],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${EdpService.name}].${EDPChaincodeMethod.CreateEDP} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getEDPById(id: string): Promise<EDP> {
    try {
      Log.server.info(
        `[${EdpService.name}] calling chaincode method [${EDPChaincodeMethod.GetEDPbyId}]`
      );

      return await this.fabricClient.query(
        EDPChaincodeMethod.GetEDPbyId,
        [id],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${EdpService.name}].${EDPChaincodeMethod.GetEDPbyId} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async queryEDP(edp: any): Promise<EDP> {
    try {
      Log.server.info(
        `[${EdpService.name}] calling chaincode method [${EDPChaincodeMethod.QueryEDP}]`
      );

      return await this.fabricClient.query(
        EDPChaincodeMethod.QueryEDP,
        [JSON.stringify(edp)],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${EdpService.name}].${EDPChaincodeMethod.QueryEDP} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateEDP(edp: EDPDto): Promise<any> {
    try {
      Log.server.info(
        `[${EdpService.name}] calling chaincode method [${EDPChaincodeMethod.UpdateEDP}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        EDPChaincodeMethod.UpdateEDP,
        [edp],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${EdpService.name}].${EDPChaincodeMethod.UpdateEDP} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }
}
