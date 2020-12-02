/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HttpException, Injectable} from '@nestjs/common';
import {PowerPlanEnergyScheduleDto} from './dto/PowerPlanEnergyScheduleDto';
import {IPowerPlanEnergyScheduleService} from './powerPlanEnergySchedule.service.interface';
import {FabricConnectorService} from '../fabric-connector/fabric-connector.service';
import {Log} from '../../common/utils/logging/Log';
import {PowerPlanEnergyScheduleChaincodeMethod} from './enum/PowerPlanEnergyScheduleChaincodeMethod';
import {PowerPlanEnergySchedule} from '../../models/PowerPlanEnergySchedule';
import {ChannelName} from '../../common/enum/ChannelName';
import {TransactionResponse} from '../fabric-connector/models/TransactionResponse';

@Injectable()
export class PowerPlanEnergyScheduleService
  implements IPowerPlanEnergyScheduleService {
  public constructor(public fabricClient: FabricConnectorService) {}

  public async createPowerPlanEnergySchedule(
    powerPlanEnergySchedule: PowerPlanEnergyScheduleDto
  ): Promise<PowerPlanEnergySchedule> {
    try {
      Log.server.info(
        `[${PowerPlanEnergyScheduleService.name}] calling chaincode method [${PowerPlanEnergyScheduleChaincodeMethod.CreatePowerPlanEnergySchedule}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        PowerPlanEnergyScheduleChaincodeMethod.CreatePowerPlanEnergySchedule,
        [powerPlanEnergySchedule],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${PowerPlanEnergyScheduleService.name}].${PowerPlanEnergyScheduleChaincodeMethod.CreatePowerPlanEnergySchedule} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async createPowerPlanEnergySchedulesFromCSV(
    powerPlanEnergySchedules: PowerPlanEnergyScheduleDto[]
  ): Promise<string[] | object> {
    try {
      const powerPlanEnergyScheduleIds: string[] = [];

      for (const powerPlanEnergySchedule of powerPlanEnergySchedules) {
        Log.server.info(
          `[${PowerPlanEnergyScheduleService.name}] Creating PowerPlanEnergySchedule from CSV`
        );
        const createdPowerPlanEnergySchedule: PowerPlanEnergySchedule = await this.createPowerPlanEnergySchedule(
          PowerPlanEnergySchedule.postPowerPlanEnergyScheduleFromJSON(
            powerPlanEnergySchedule
          )
        );

        powerPlanEnergyScheduleIds.push(
          createdPowerPlanEnergySchedule.powerPlanEnergyScheduleId
        );
      }

      return powerPlanEnergyScheduleIds;
    } catch (error) {
      Log.server.error(
        `[${PowerPlanEnergyScheduleService.name}].${PowerPlanEnergyScheduleChaincodeMethod.CreatePowerPlanEnergySchedule} while registering sites from CSV failed with: [${error.message}]`
      );

      return {
        errorMessage: error.message
      };
    }
  }

  public async updatePowerPlanEnergySchedule(
    powerPlanEnergySchedule: PowerPlanEnergyScheduleDto
  ): Promise<PowerPlanEnergySchedule> {
    try {
      Log.server.info(
        `[${PowerPlanEnergyScheduleService.name}] calling chaincode method [${PowerPlanEnergyScheduleChaincodeMethod.CreatePowerPlanEnergySchedule}]`
      );
      const response: TransactionResponse = await this.fabricClient.invoke(
        PowerPlanEnergyScheduleChaincodeMethod.UpdatePowerPlanEnergySchedule,
        [powerPlanEnergySchedule],
        ChannelName.StarNetwork
      );

      return response.payload;
    } catch (error) {
      Log.server.error(
        `[${PowerPlanEnergyScheduleService.name}].${PowerPlanEnergyScheduleChaincodeMethod.UpdatePowerPlanEnergySchedule} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async getPowerPlanEnergyScheduleById(
    id: string
  ): Promise<PowerPlanEnergySchedule> {
    try {
      Log.server.info(
        `[${PowerPlanEnergyScheduleService.name}] calling chaincode method [${PowerPlanEnergyScheduleChaincodeMethod.GetPowerPlanEnergyScheduleById}]`
      );

      return await this.fabricClient.query(
        PowerPlanEnergyScheduleChaincodeMethod.GetPowerPlanEnergyScheduleById,
        [id],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${PowerPlanEnergyScheduleService.name}].${PowerPlanEnergyScheduleChaincodeMethod.GetPowerPlanEnergyScheduleById} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }

  public async queryPowerPlanEnergySchedule(
    powerPlanEnergyScheduleQuery: any
  ): Promise<PowerPlanEnergySchedule> {
    try {
      Log.server.info(
        `[${PowerPlanEnergyScheduleService.name}] calling chaincode method [${PowerPlanEnergyScheduleChaincodeMethod.QueryPowerPlanEnergySchedule}]`
      );

      return await this.fabricClient.query(
        PowerPlanEnergyScheduleChaincodeMethod.QueryPowerPlanEnergySchedule,
        [JSON.stringify(powerPlanEnergyScheduleQuery)],
        ChannelName.StarNetwork
      );
    } catch (error) {
      Log.server.error(
        `[${PowerPlanEnergyScheduleService.name}].${PowerPlanEnergyScheduleChaincodeMethod.QueryPowerPlanEnergySchedule} failed with: [${error.message}]`
      );
      throw new HttpException(error.message, error.status ? error.status : 500);
    }
  }
}
