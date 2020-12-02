/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import {EdpService} from './edp.service';
import {EDP} from '../../models/EDP';
import {EDPDto} from './dto/EDPDto';
import {AuthGuard} from '../../guards/auth-guard';

@Controller('edp')
@ApiTags('EDP')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class EdpController {
  public constructor(public edpService: EdpService) {}

  @Post()
  @ApiOperation({description: 'Create a new EDP'})
  @ApiResponse({
    status: 201,
    description: 'Registers a new EDP on the blockchain',
    type: EDPDto
  })
  public async createEdp(@Body() edp: EDPDto): Promise<EDP> {
    return await this.edpService.createEDP(EDP.postEDPFromJSON(edp));
  }

  @Put()
  public async updateEDP(@Body() edp: EDPDto): Promise<EDPDto> {
    return await this.edpService.updateEDP(edp);
  }

  @Get('/:id')
  @ApiOperation({description: 'Get an EDP by ID'})
  @ApiResponse({status: 200, description: 'Get an EDP by ID', type: EDPDto})
  public async getEDPById(@Param('id') id: string): Promise<EDPDto> {
    return await this.edpService.getEDPById(id);
  }

  @Get()
  @ApiOperation({description: "Queries EDP's by a query parameter in the url"})
  @ApiResponse({
    status: 200,
    description: "Queries EDP's by a query parameter in the url",
    type: EDPDto
  })
  public async queryEDP(@Query() query: string): Promise<EDP> {
    return await this.edpService.queryEDP(query);
  }
}
