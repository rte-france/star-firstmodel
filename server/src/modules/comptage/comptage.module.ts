/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {AuthModule} from '../authentication/auth.module';
import {FabricConnectorModule} from '../fabric-connector/fabric-connector.module';
import {ComptageMVService} from './MV/comptageMV.service';
import {ComptageHVService} from './HV/comptageHV.service';
import {ComptageMVController} from './MV/comptageMV.controller';
import {ComptageHVController} from './HV/comptageHV.controller';

@Module({
  imports: [AuthModule, FabricConnectorModule],
  controllers: [ComptageMVController, ComptageHVController],
  providers: [ComptageMVService, ComptageHVService]
})
export class ComptageModule {}
