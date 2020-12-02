/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {AuthModule} from '../authentication/auth.module';
import {FabricConnectorModule} from '../fabric-connector/fabric-connector.module';
import {ActivationController} from './activation.controller';
import {ActivationService} from './activation.service';

@Module({
  imports: [AuthModule, FabricConnectorModule],
  controllers: [ActivationController],
  providers: [ActivationService]
})
export class ActivationModule {}
