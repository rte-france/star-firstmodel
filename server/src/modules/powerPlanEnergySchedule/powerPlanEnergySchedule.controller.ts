/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {
  Body,
  Controller,
  Get,
  Param,
  Query,
  Post,
  Put,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {PowerPlanEnergyScheduleDto} from './dto/PowerPlanEnergyScheduleDto';
import {PowerPlanEnergyScheduleService} from './powerPlanEnergySchedule.service';
import {CSVParser} from '../../utils/CSVParser';
import {PowerPlanEnergySchedule} from '../../models/PowerPlanEnergySchedule';
import {AuthGuard} from '../../guards/auth-guard';

@Controller('powerPlanEnergySchedule')
@ApiTags('powerPlanEnergySchedule')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class PowerPlanEnergyScheduleController {
  public constructor(
    private readonly powerPlanEnergyScheduleService: PowerPlanEnergyScheduleService
  ) {}

  @Post()
  @ApiOperation({description: 'Create a new PowerPlanEnergySchedule'})
  @ApiResponse({
    status: 201,
    description: 'Registers a new PowerPlanEnergySchedule on the blockchain',
    type: PowerPlanEnergyScheduleDto
  })
  public async createPowerPlanEnergySchedule(
    @Body() powerPlanEnergySchedule: PowerPlanEnergyScheduleDto
  ): Promise<PowerPlanEnergyScheduleDto> {
    return await this.powerPlanEnergyScheduleService.createPowerPlanEnergySchedule(
      PowerPlanEnergySchedule.postPowerPlanEnergyScheduleFromJSON(
        powerPlanEnergySchedule
      )
    );
  }

  @Post('/csv-upload')
  @UseGuards(FileInterceptor('csv', {dest: '/upload/csv/'}))
  public async createPowerPlanEnergySchedulesFromCSV(
    @UploadedFile() file: any
  ): Promise<any> {
    const powerPlanEnergySchedules: PowerPlanEnergyScheduleDto[] = await CSVParser.parse<
      PowerPlanEnergyScheduleDto
    >(file.path);

    return await this.powerPlanEnergyScheduleService.createPowerPlanEnergySchedulesFromCSV(
      powerPlanEnergySchedules
    );
  }

  @Put('/:id')
  @ApiOperation({description: 'Update an existing PowerPlanEnergySchedule'})
  @ApiResponse({
    status: 201,
    description: 'Updates an existing PowerPlanEnergySchedule',
    type: PowerPlanEnergyScheduleDto
  })
  public async updatePowerPlanEnergySchedule(
    @Body() powerPlanEnergySchedule: PowerPlanEnergyScheduleDto
  ): Promise<PowerPlanEnergyScheduleDto> {
    return await this.powerPlanEnergyScheduleService.updatePowerPlanEnergySchedule(
      PowerPlanEnergySchedule.postPowerPlanEnergyScheduleFromJSON(
        powerPlanEnergySchedule
      )
    );
  }

  @Get()
  @ApiOperation({
    description:
      'Queries PowerPlanEnergySchedules by a query parameter in the url'
  })
  @ApiResponse({
    status: 200,
    description:
      'Queries PowerPlanEnergySchedules by a query parameter in the url',
    type: PowerPlanEnergyScheduleDto
  })
  public async queryPowerPlanEnergySchedule(
    @Query() query: string
  ): Promise<PowerPlanEnergyScheduleDto> {
    return await this.powerPlanEnergyScheduleService.queryPowerPlanEnergySchedule(
      query
    );
  }

  @Get('/:id')
  @ApiOperation({description: 'Get a PowerPlanEnergySchedule by ID'})
  @ApiResponse({
    status: 200,
    description: 'Get a PowerPlanEnergySchedule by ID',
    type: PowerPlanEnergyScheduleDto
  })
  public async getPowerPlanEnergyScheduleById(
    @Param('id') id: string
  ): Promise<PowerPlanEnergyScheduleDto> {
    return await this.powerPlanEnergyScheduleService.getPowerPlanEnergyScheduleById(
      id
    );
  }
}
