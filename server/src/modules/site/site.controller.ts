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
import {SiteDto} from './dto/SiteDto';
import {SiteService} from './site.service';
import {CSVParser} from '../../utils/CSVParser';
import {Site} from '../../models/Site';
import {AuthGuard} from '../../guards/auth-guard';

@Controller('site')
@ApiTags('site')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class SiteController {
  public constructor(private readonly siteService: SiteService) {}

  @Post()
  @ApiOperation({description: 'Create a new site'})
  @ApiResponse({
    status: 201,
    description: 'Registers a new Site on the blockchain',
    type: SiteDto
  })
  public async createSite(@Body() site: SiteDto): Promise<SiteDto> {
    return await this.siteService.createSite(Site.postSiteFromJSON(site));
  }

  @Post('/csv-upload')
  @UseGuards(FileInterceptor('csv', {dest: '/upload/csv/'}))
  public async createSitesFromCSV(
    @UploadedFile() file: any
  ): Promise<string[]> {
    const sites: SiteDto[] = await CSVParser.parse<SiteDto>(file.path);

    return await this.siteService.createSitesFromCSV(sites);
  }

  @Put('/:id')
  @ApiOperation({description: 'Update an existing site'})
  @ApiResponse({
    status: 201,
    description: 'Updates an existing site',
    type: SiteDto
  })
  public async updateSite(@Body() site: SiteDto): Promise<SiteDto> {
    return await this.siteService.updateSite(Site.postSiteFromJSON(site));
  }

  @Get('/all')
  @ApiOperation({description: 'Get all sites'})
  @ApiResponse({
    status: 200,
    description: 'Gets all currently registered sites',
    type: SiteDto
  })
  public async getAllSites(): Promise<SiteDto[]> {
    return await this.siteService.getAllSites();
  }

  @Get()
  @ApiOperation({description: 'Queries sites by a query parameter in the url'})
  @ApiResponse({
    status: 200,
    description: 'Queries sites by a query parameter in the url',
    type: SiteDto
  })
  public async querySite(@Query() query: string): Promise<Site[]> {
    return await this.siteService.querySite(query);
  }

  @Get('/:id')
  @ApiOperation({description: 'Get a site by ID'})
  @ApiResponse({status: 200, description: 'Get a site by ID', type: SiteDto})
  public async getSiteById(@Param('id') id: string): Promise<SiteDto> {
    return await this.siteService.getSiteById(id);
  }
}
