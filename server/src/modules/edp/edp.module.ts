/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {EdpController} from './edp.controller';
import {EdpService} from './edp.service';
import {AuthModule} from '../authentication/auth.module';
import {FabricConnectorModule} from '../fabric-connector/fabric-connector.module';

@Module({
  imports: [AuthModule, FabricConnectorModule],
  controllers: [EdpController],
  providers: [EdpService]
})
export class EdpModule {}
