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
import {EDA} from '../../models/EDA';
import {EDADto} from './dto/EDADto';
import {EdaService} from './eda.service';
import {AuthGuard} from '../../guards/auth-guard';


@Controller('eda')
@ApiTags('EDA')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class EdaController {
  public constructor(public edaService: EdaService) {}

  @Post()
  @ApiOperation({description: 'Create a new EDA'})
  @ApiResponse({
    status: 201,
    description: 'Registers a new EDA on the blockchain',
    type: EDADto
  })
  public async createEDA(@Body() eda: EDADto): Promise<EDA> {
    return await this.edaService.createEDA(EDA.postEDAFromJSON(eda));
  }

  @Put('/')
  public async updateEDA(@Body() eda: EDADto): Promise<EDA> {
    return await this.edaService.updateEDA(eda);
  }

  @Get('/all')
  @ApiOperation({description: 'Get an EDA by ID'})
  @ApiResponse({status: 200, description: 'Get an EDA by ID', type: EDADto})
  public async getAllEDAs(): Promise<EDA[]> {
    return await this.edaService.getAllEDAs();
  }

  @Get()
  @ApiOperation({description: "Queries EDA's by a query parameter in the url"})
  @ApiResponse({
    status: 200,
    description: "Queries EDP's by a query parameter in the url",
    type: EDADto
  })
  public async queryEDA(@Query() query: EDADto): Promise<EDA> {
    return await this.edaService.queryEDA(query);
  }

  @Get(':id')
  @ApiOperation({description: 'Get an EDA by ID'})
  @ApiResponse({status: 200, description: 'Get an EDA by ID', type: EDADto})
  public async getEDAById(@Param('id') id: string): Promise<EDA> {
    return await this.edaService.getEDAbyId(id);
  }
}
