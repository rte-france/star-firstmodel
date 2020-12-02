/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Controller, Get, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {ActivationService} from './activation.service';
import {Activation} from '../../models/Activation';
import {AuthGuard} from '../../guards/auth-guard';

@Controller('activations')
@ApiTags('activations')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ActivationController {
  public constructor(private activationService: ActivationService) {}

  @Get('/all')
  public async getActivations(): Promise<Activation[]> {
    return await this.activationService.getActivations();
  }
}
