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
import {BidDto} from './dto/BidDto';
import {BidService} from './bid.service';
import {CSVParser} from '../../utils/CSVParser';
import {Bid} from '../../models/Bid';
import {AuthGuard} from '../../guards/auth-guard';

@Controller('bid')
@ApiTags('bid')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class BidController {
  public constructor(private readonly bidService: BidService) {}

  @Post()
  @ApiOperation({description: 'Create a new bid'})
  @ApiResponse({
    status: 201,
    description: 'Registers a new bid on the blockchain',
    type: BidDto
  })
  public async createBid(@Body() bid: BidDto): Promise<Bid> {
    return await this.bidService.createBid(Bid.postBidFromJSON(bid));
  }

  @Post('/csv-upload')
  @UseGuards(FileInterceptor('csv', {dest: '/upload/csv/'}))
  public async createBidsFromCSV(@UploadedFile() file: any): Promise<any> {
    const bids: BidDto[] = await CSVParser.parse<BidDto>(file.path);

    return await this.bidService.createBidsFromCSV(bids);
  }

  @Put()
  @ApiOperation({description: 'Update an existing bid'})
  @ApiResponse({
    status: 201,
    description: 'Updates an existing bid',
    type: BidDto
  })
  public async updateBid(@Body() bid: BidDto): Promise<BidDto> {
    return await this.bidService.updateBid(bid);
  }

  @Get('/all')
  @ApiOperation({description: 'Get all bids'})
  @ApiResponse({
    status: 200,
    description: 'Gets all currently registered bids',
    type: BidDto
  })
  public async getAllBids(): Promise<BidDto[]> {
    return await this.bidService.getAllBids();
  }

  @Get()
  @ApiOperation({description: 'Queries bids by a query parameter in the url'})
  @ApiResponse({
    status: 200,
    description: 'Queries bids by a query parameter in the url',
    type: BidDto
  })
  public async queryBid(@Query() query: BidDto): Promise<BidDto> {
    return await this.bidService.queryBid(query);
  }

  @Get('/:id')
  @ApiOperation({description: 'Get an bid by ID'})
  @ApiResponse({status: 200, description: 'Get an bid by ID', type: BidDto})
  public async getBidById(@Param('id') id: string): Promise<BidDto> {
    return await this.bidService.getBidById(id);
  }
}
