/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {HVDto} from '../dto/HVDto';
import {FabricConnectorService} from '../../fabric-connector/fabric-connector.service';
import {Log} from '../../../common/utils/logging/Log';
import {ComptageHVChaincodeMethod} from '../enum/ComptageHVChaincodeMethod';
import {IComptageHVService} from './comptageHV.service.interface';
import {HV} from '../../../models/HV';
import {ChannelName} from '../../../common/enum/ChannelName';
import {TransactionResponse} from '../../fabric-connector/models/TransactionResponse';

@Injectable()
export class ComptageHVService implements IComptageHVService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async createComptageHV(hv: HVDto): Promise<HV> {
    try {
      Log.server.info(
        `[${ComptageHVService.name}] calling chaincode method [${ComptageHVChaincodeMethod.CreateHV}]`
      );

      const response: TransactionResponse = await this.fabricClient.invoke(
        ComptageHVChaincodeMethod.CreateHV,
        [hv],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${ComptageHVService.name}].${ComptageHVChaincodeMethod.GetHVyId} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async updateComptageHV(hv: HVDto): Promise<HV> {
    try {
      Log.server.info(
        `[${ComptageHVService.name}] calling chaincode method [${ComptageHVChaincodeMethod.UpdateHV}]`
      );

      const response: TransactionResponse = await this.fabricClient.invoke(
        ComptageHVChaincodeMethod.UpdateHV,
        [hv],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${ComptageHVService.name}].${ComptageHVChaincodeMethod.UpdateHV} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async createHVFromCSV(hvs: HVDto[]): Promise<string[] | object> {
    try {
      const hvIDs: string[] = [];

      for (const hv of hvs) {
        const createdHV: HV = await this.createComptageHV(
          HV.postHVFromJSON(hv)
        );

        hvIDs.push(createdHV.energyAccountMarketDocumentMrid);
      }

      return hvIDs;
    } catch (error) {
      Log.server.error(
        `[${ComptageHVService.name}].${ComptageHVChaincodeMethod.CreateHV} while registering HV's from CSV failed with: [${error.message}]`
      );

      return {
        errorMessage: error.message
      };
    }
  }

  public async getComptageHVyId(id: string): Promise<HV> {
    try {
      Log.server.info(
        `[${ComptageHVService.name}] calling chaincode method [${ComptageHVChaincodeMethod.CreateHV}]`
      );

      return await this.fabricClient.query(
        ComptageHVChaincodeMethod.GetHVyId,
        [id],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${ComptageHVService.name}].${ComptageHVChaincodeMethod.GetHVyId} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async queryComptageHV(hv: HV): Promise<HV> {
    try {
      Log.server.info(
        `[${ComptageHVService.name}] calling chaincode method [${ComptageHVChaincodeMethod.QueryHV}]`
      );

      return await this.fabricClient.query(
        ComptageHVChaincodeMethod.QueryHV,
        [JSON.stringify(hv)],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${ComptageHVService.name}].${ComptageHVChaincodeMethod.QueryHV} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }
}
