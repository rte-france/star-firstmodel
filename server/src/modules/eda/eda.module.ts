/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {AuthModule} from '../authentication/auth.module';
import {FabricConnectorModule} from '../fabric-connector/fabric-connector.module';
import {EdaController} from './eda.controller';
import {EdaService} from './eda.service';

@Module({
  imports: [AuthModule, FabricConnectorModule],
  controllers: [EdaController],
  providers: [EdaService]
})
export class EdaModule {}
