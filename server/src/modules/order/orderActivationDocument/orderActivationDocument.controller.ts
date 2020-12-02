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
import {OrderActivationDocumentService} from './orderActivationDocument.service';
import {OrderActivationDocumentDto} from './dto/OrderActivationDocumentDto';
import {OrderActivationDocument} from '../../../models/OrderActivationDocument';
import {AuthGuard} from '../../../guards/auth-guard';

@Controller('orderActivationDocument')
@ApiTags('orderActivationDocument')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class OrderActivationDocumentController {
  public constructor(
    private readonly orderActivationDocumentService: OrderActivationDocumentService
  ) {}

  @Post('/')
  @ApiOperation({description: 'Create a new orderActivationDocument'})
  @ApiResponse({
    status: 201,
    description: 'Registers a new orderActivationDocument on the blockchain',
    type: OrderActivationDocumentDto
  })
  public async createOrderActivationDocument(
    @Body() orderActivationDocument: OrderActivationDocumentDto
  ): Promise<any> {
    return await this.orderActivationDocumentService.createOrderActivationDocument(
      OrderActivationDocument.postOrderActivationDocumentFromJSON(
        orderActivationDocument
      )
    );
  }

  @Put('/:id')
  @ApiOperation({description: 'Update orderActivationDocument'})
  @ApiResponse({
    status: 200,
    description: 'Updates orderActivationDocument by id',
    type: OrderActivationDocumentDto
  })
  public async updateOrderActivationDocument(
    @Body() order: OrderActivationDocument,
    @Param('id') id: string
  ): Promise<OrderActivationDocumentDto> {
    return await this.orderActivationDocumentService.updateOrderActivationDocument(
      order,
      id
    );
  }

  @Get('/')
  @ApiOperation({
    description:
      'Queries orderActivationDocuments by a query parameter in the url'
  })
  @ApiResponse({
    status: 200,
    description:
      'Queries orderActivationDocuments by a query parameter in the url',
    type: OrderActivationDocumentDto
  })
  public async queryOrderActivationDocument(
    @Query() query: any
  ): Promise<OrderActivationDocumentDto[]> {
    return await this.orderActivationDocumentService.queryOrderActivationDocument(
      query
    );
  }

  @Get('/all')
  @ApiOperation({description: 'Get all orderActivationDocuments'})
  @ApiResponse({
    status: 200,
    description: 'Get all orderActivationDocuments',
    type: OrderActivationDocumentDto
  })
  public async getAllOrderActivationDocuments(): Promise<
    OrderActivationDocumentDto[]
  > {
    return await this.orderActivationDocumentService.getAllOrderActivationDocuments();
  }

  @Get('orderActivationDocumentId/:id')
  @ApiOperation({description: 'Get orderActivationDocument by id'})
  @ApiResponse({
    status: 200,
    description: 'Get orderActivationDocument by id',
    type: OrderActivationDocumentDto
  })
  public async getOrderActivationDocumentById(
    @Param('id') id: string
  ): Promise<OrderActivationDocumentDto> {
    return await this.orderActivationDocumentService.getOrderActivationDocumentById(
      id
    );
  }
}
