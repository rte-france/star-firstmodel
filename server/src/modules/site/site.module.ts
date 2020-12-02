/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {SiteService} from './site.service';
import {SiteController} from './site.controller';
import {AuthModule} from '../authentication/auth.module';
import {FabricConnectorModule} from '../fabric-connector/fabric-connector.module';

@Module({
  imports: [AuthModule, FabricConnectorModule],
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService]
})
export class SiteModule {}
