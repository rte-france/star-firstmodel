/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Get, Controller} from '@nestjs/common';
import {ReadinessProbeService} from './readiness-probe.service';
import {ApiTags} from '@nestjs/swagger';

@Controller('readiness-probe')
export class ReadinessProbeController {
  public constructor(
    private readonly readinessProbeService: ReadinessProbeService
  ) {}

  @Get()
  public ready(): string {
    return this.readinessProbeService.ready();
  }
}
