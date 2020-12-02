/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {BidController} from './bid.controller';
import {AuthModule} from '../authentication/auth.module';
import {FabricConnectorModule} from '../fabric-connector/fabric-connector.module';
import {BidService} from './bid.service';

@Module({
  imports: [AuthModule, FabricConnectorModule],
  controllers: [BidController],
  providers: [BidService]
})
export class BidModule {}
