/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {
  Body,
  Controller,
  Post,
  Get,
  Param,
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
import {OrderBySiteActivationDocumentService} from './orderBySiteActivationDocument.service';
import {OrderActivationDocumentDto} from '../orderActivationDocument/dto/OrderActivationDocumentDto';
import {OrderActivationDocument} from '../../../models/OrderActivationDocument';
import {OrderBySiteActivationDocument} from '../../../models/OrderBySiteActivationDocument';
import {LogOrder} from '../../../models/LogOrder';
import {AuthGuard} from '../../../guards/auth-guard';
import {TransactionResponse} from '../../fabric-connector/models/TransactionResponse';
import {OrderBySiteActivationDocumentDto} from './dto/OrderBySiteActivationDocumentDto';

@Controller('order/orderBySiteActivationDocument')
@ApiTags('orderBySiteActivationDocument')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class OrderBySiteActivationDocumentController {
  public constructor(
    private orderBySiteActivationDocumentService: OrderBySiteActivationDocumentService
  ) {}

  @Post('/')
  @ApiOperation({description: 'Creates orderBySiteActivationDocuments'})
  @ApiResponse({
    status: 201,
    description: 'Creates orderBySiteActivationDocuments',
    type: OrderBySiteActivationDocumentDto
  })
  public async createOrderBySiteActivationDocument(
    @Body() orderBySites: OrderBySiteActivationDocumentDto[]
  ): Promise<any> {
    return await this.orderBySiteActivationDocumentService.createOrderBySiteActivationDocument(
      orderBySites
    );
  }

  @Put('/end/:orderId')
  @ApiOperation({description: 'Update orderBySiteActivationDocument end date'})
  @ApiResponse({
    status: 200,
    description: 'Queries orderBySiteActivationDocument end date',
    type: OrderBySiteActivationDocumentDto
  })
  public async updateOrderActivationDocumentEnd(
    @Body() orderActivationDocument: OrderActivationDocumentDto,
    @Param('orderId') orderId: string
  ): Promise<any> {
    return await this.orderBySiteActivationDocumentService.updateOrderActivationDocumentEnd(
      OrderActivationDocument.postOrderActivationDocumentFromJSON(
        orderActivationDocument
      ),
      orderId
    );
  }

  @Put('/updateOrderBySiteActivationDocumentById/:id')
  public async updateOrderBySiteActivationDocument(
    @Body()
    updatedOrderBySiteActivationDocument: OrderBySiteActivationDocumentDto,
    @Param('id') id: string
  ): Promise<TransactionResponse> {
    return await this.orderBySiteActivationDocumentService.updateOrderBySiteActivationDocument(
      updatedOrderBySiteActivationDocument,
      id
    );
  }

  @Put('/:orderBySiteActivationDocumentId/logOrder')
  public async createLogOrder(
    @Body() logOrder: LogOrder,
    @Param('orderBySiteActivationDocumentId')
    orderBySiteActivationDocumentId: string
  ): Promise<TransactionResponse> {
    return this.orderBySiteActivationDocumentService.updateOrderBySiteActivationDocumentWithLogOrder(
      logOrder,
      orderBySiteActivationDocumentId
    );
  }

  @Get()
  @ApiOperation({description: 'Query orderBySiteActivationDocument'})
  @ApiResponse({
    status: 200,
    description: 'Queries orderBySiteActivationDocument',
    type: OrderBySiteActivationDocument
  })
  public async queryOrderBySiteActivationDocument(
    @Query() query: any
  ): Promise<OrderBySiteActivationDocument[]> {
    return await this.orderBySiteActivationDocumentService.queryOrderBySiteActivationDocument(
      query
    );
  }

  @Get('/all')
  @ApiOperation({description: 'Get all orderBySiteActivationDocument'})
  @ApiResponse({
    status: 200,
    description: 'Queries orderBySiteActivationDocument',
    type: OrderBySiteActivationDocument
  })
  public async getAllOrderBySiteActivationDocuments(): Promise<
    OrderBySiteActivationDocument[]
  > {
    return await this.orderBySiteActivationDocumentService.getAllOrderBySiteActivationDocuments();
  }

  @Get('/orderBySiteActivationDocumentId/:id')
  public async getOrderBySiteActivationDocumentById(
    @Param('id') id: string
  ): Promise<OrderBySiteActivationDocument> {
    return await this.orderBySiteActivationDocumentService.getOrderBySiteActivationDocumentById(
      id
    );
  }
}
