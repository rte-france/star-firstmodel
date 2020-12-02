/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {ReadinessProbeController} from './readiness-probe.controller';
import {ReadinessProbeService} from './readiness-probe.service';

@Module({
  imports: [],
  controllers: [ReadinessProbeController],
  providers: [ReadinessProbeService]
})
export class ReadinessProbeModule {}
