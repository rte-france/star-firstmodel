/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {FabricConnectorService} from './fabric-connector.service';
import {AuthModule} from '../authentication/auth.module';

@Module({
  imports: [AuthModule],
  providers: [FabricConnectorService],
  exports: [FabricConnectorService]
})
export class FabricConnectorModule {}

