/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {MVDto} from '../dto/MVDto';
import {FabricConnectorService} from '../../fabric-connector/fabric-connector.service';
import {Log} from '../../../common/utils/logging/Log';
import {ComptageMVChaincodeMethod} from '../enum/ComptageMVChaincodeMethod';
import {IComptageMVService} from './comptageMV.service.interface';
import {MV} from '../../../models/MV';
import {ChannelName} from '../../../common/enum/ChannelName';
import {TransactionResponse} from '../../fabric-connector/models/TransactionResponse';

@Injectable()
export class ComptageMVService implements IComptageMVService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async createComptageMV(mv: MVDto): Promise<MV> {
    try {
      Log.server.info(
        `[${ComptageMVService.name}] calling chaincode method [${ComptageMVChaincodeMethod.CreateMV}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        ComptageMVChaincodeMethod.CreateMV,
        [mv],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${ComptageMVService.name}].${ComptageMVChaincodeMethod.GetMVById} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateComptageMV(mv: MVDto): Promise<MV> {
    try {
      Log.server.info(
        `[${ComptageMVService.name}] calling chaincode method [${ComptageMVChaincodeMethod.UpdateMV}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        ComptageMVChaincodeMethod.UpdateMV,
        [mv],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${ComptageMVService.name}].${ComptageMVChaincodeMethod.UpdateMV} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async createMVFromCSV(mvs: MV[]): Promise<string[] | object> {
    try {
      const mvIDs: string[] = [];

      for (const mv of mvs) {
        const createdMV: MV = await this.createComptageMV(
          MV.postMVFromJSON(mv)
        );

        mvIDs.push(createdMV.energyAccountMarketDocumentMrid);
      }

      return mvIDs;
    } catch (error) {
      Log.server.error(
        `[${ComptageMVService.name}].${ComptageMVChaincodeMethod.CreateMV} while registering MV's from CSV failed with: [${error.message}]`
      );

      return {
        errorMessage: error.message
      };
    }
  }

  public async getComptageMVById(id: string): Promise<MV> {
    try {
      Log.server.info(
        `[${ComptageMVService.name}] calling chaincode method [${ComptageMVChaincodeMethod.CreateMV}]`
      );

      return await this.fabricClient.query(
        ComptageMVChaincodeMethod.GetMVById,
        [id],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${ComptageMVService.name}].${ComptageMVChaincodeMethod.GetMVById} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async queryComptageMV(mv: MVDto): Promise<MV> {
    try {
      Log.server.info(
        `[${ComptageMVService.name}] calling chaincode method [${ComptageMVChaincodeMethod.QueryMV}]`
      );

      return await this.fabricClient.query(
        ComptageMVChaincodeMethod.QueryMV,
        [JSON.stringify(mv)],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${ComptageMVService.name}].${ComptageMVChaincodeMethod.QueryMV} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }
}
