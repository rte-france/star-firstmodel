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
import {MVDto} from '../dto/MVDto';
import {ComptageMVService} from './comptageMV.service';
import {CSVParser} from '../../../utils/CSVParser';
import {MV} from '../../../models/MV';
import {AuthGuard} from '../../../guards/auth-guard';

@Controller('comptage/MV')
@ApiTags('energyAccountMarketDocumentMV')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ComptageMVController {
  public constructor(private readonly comptageService: ComptageMVService) {}

  @Post()
  @ApiOperation({description: 'Create a new MV'})
  @ApiResponse({
    status: 201,
    description: 'Registers a new MV on the blockchain',
    type: MVDto
  })
  public async createComptageMV(@Body() mv: MVDto): Promise<MV> {
    return await this.comptageService.createComptageMV(MV.postMVFromJSON(mv));
  }

  @Post('/csv-upload')
  @UseGuards(FileInterceptor('csv', {dest: '/upload/csv/'}))
  public async createMVFromCSV(@UploadedFile() file: any): Promise<any> {
    const mvs: MVDto[] = await CSVParser.parse<MVDto>(file.path);

    return await this.comptageService.createMVFromCSV(mvs);
  }

  @Put()
  @ApiOperation({description: 'Update an existing MV'})
  @ApiResponse({
    status: 201,
    description: 'Updates an existing MV',
    type: MVDto
  })
  public async updateComptageMV(@Body() mv: MVDto): Promise<MV> {
    return await this.comptageService.updateComptageMV(mv);
  }

  @Get()
  @ApiOperation({description: 'Queries MV by a query parameter in the url'})
  @ApiResponse({
    status: 200,
    description: 'Queries MV by a query parameter in the url',
    type: MVDto
  })
  public async queryComptageMV(@Query() query: MVDto): Promise<MV> {
    return await this.comptageService.queryComptageMV(query);
  }

  @Get('/:id')
  @ApiOperation({description: 'Get a MV by ID'})
  @ApiResponse({status: 200, description: 'Get a MV by ID', type: MVDto})
  public async getComptageMVById(@Param('id') id: string): Promise<MVDto> {
    return await this.comptageService.getComptageMVById(id);
  }
}
