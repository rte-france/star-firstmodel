/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {Log} from '../../common/utils/logging/Log';
import {FabricConnectorService} from '../fabric-connector/fabric-connector.service';
import {IEDAService} from './eda.service.interface';
import {EDADto} from './dto/EDADto';
import {EDA} from '../../models/EDA';
import {EDAChaincodeMethod} from './enum/EDAChaincodeMethod';
import {ChannelName} from '../../common/enum/ChannelName';
import {TransactionResponse} from '../fabric-connector/models/TransactionResponse';

@Injectable()
export class EdaService implements IEDAService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async createEDA(eda: EDADto): Promise<EDA> {
    try {
      Log.server.info(
        `[${EdaService.name}] calling chaincode method [${EDAChaincodeMethod.CreateEDA}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        EDAChaincodeMethod.CreateEDA,
        [eda],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${EdaService.name}].${EDAChaincodeMethod.CreateEDA} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getEDAbyId(id: string): Promise<EDA> {
    try {
      Log.server.info(
        `[${EdaService.name}] calling chaincode method [${EDAChaincodeMethod.GetEDAById}]`
      );

      return await this.fabricClient.query(
        EDAChaincodeMethod.GetEDAById,
        [id],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${EdaService.name}].${EDAChaincodeMethod.GetEDAById} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getAllEDAs(): Promise<EDA[]> {
    try {
      Log.server.info(
        `[${EdaService.name}] calling chaincode method [${EDAChaincodeMethod.GetAllEDAs}]`
      );

      return await this.fabricClient.query(
        EDAChaincodeMethod.GetAllEDAs,
        [],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${EdaService.name}].${EDAChaincodeMethod.GetAllEDAs} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async queryEDA(eda: EDADto): Promise<EDA> {
    try {
      Log.server.info(
        `[${EdaService.name}] calling chaincode method [${EDAChaincodeMethod.QueryEDA}]`
      );

      return await this.fabricClient.query(
        EDAChaincodeMethod.QueryEDA,
        [JSON.stringify(eda)],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${EdaService.name}].${EDAChaincodeMethod.QueryEDA} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateEDA(eda: EDADto): Promise<any> {
    try {
      Log.server.info(
        `[${EdaService.name}] calling chaincode method [${EDAChaincodeMethod.UpdateEDA}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        EDAChaincodeMethod.UpdateEDA,
        [eda],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${EdaService.name}].${EDAChaincodeMethod.UpdateEDA} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }
}
