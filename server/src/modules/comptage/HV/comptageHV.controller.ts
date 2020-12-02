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
import {HVDto} from '../dto/HVDto';
import {ComptageHVService} from './comptageHV.service';
import {CSVParser} from '../../../utils/CSVParser';
import {HV} from '../../../models/HV';
import {AuthGuard} from '../../../guards/auth-guard';

@Controller('comptage/HV')
@ApiTags('energyAccountMarketDocumentHV')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ComptageHVController {
  public constructor(private readonly comptageService: ComptageHVService) {}

  @Post()
  @ApiOperation({description: 'Create a new HV'})
  @ApiResponse({
    status: 201,
    description: 'Registers a new HV on the blockchain',
    type: HVDto
  })
  public async createComptageHV(@Body() hv: HVDto): Promise<HV> {
    return await this.comptageService.createComptageHV(HV.postHVFromJSON(hv));
  }

  @Post('/csv-upload')
  @UseGuards(FileInterceptor('csv', {dest: '/upload/csv/'}))
  public async createHVFromCSV(@UploadedFile() file: any): Promise<any> {
    const hvs: HVDto[] = await CSVParser.parse<HVDto>(file.path);

    return await this.comptageService.createHVFromCSV(hvs);
  }

  @Put()
  @ApiOperation({description: 'Update an existing HV'})
  @ApiResponse({
    status: 201,
    description: 'Updates an existing HV',
    type: HVDto
  })
  public async updateComptageHV(@Body() hv: HVDto): Promise<HV> {
    return await this.comptageService.updateComptageHV(hv);
  }

  @Get()
  @ApiOperation({description: 'Queries HV by a query parameter in the url'})
  @ApiResponse({
    status: 200,
    description: 'Queries HV by a query parameter in the url',
    type: HVDto
  })
  public async queryComptageHV(@Query() query: HVDto): Promise<HV> {
    return await this.comptageService.queryComptageHV(query);
  }

  @Get('/:id')
  @ApiOperation({description: 'Get a HV by ID'})
  @ApiResponse({status: 200, description: 'Get a HV by ID', type: HVDto})
  public async getComptageHVyId(@Param('id') id: string): Promise<HVDto> {
    return await this.comptageService.getComptageHVyId(id);
  }
}
