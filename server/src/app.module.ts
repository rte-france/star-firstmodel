/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common';
import {AuthModule} from './modules/authentication/auth.module';
import {FabricConnectorModule} from './modules/fabric-connector/fabric-connector.module';
import {OrderModule} from './modules/order/order.module';
import {ReadinessProbeModule} from './modules/readiness-probe/readiness-probe.module';
import {ReadinessProbeController} from './modules/readiness-probe/readiness-probe.controller';
import {SiteModule} from './modules/site/site.module';
import {PowerPlanEnergyScheduleModule} from './modules/powerPlanEnergySchedule/powerPlanEnergySchedule.module';
import {EdpModule} from './modules/edp/edp.module';
import {ComptageModule} from './modules/comptage/comptage.module';
import {EdaModule} from './modules/eda/eda.module';
import {BidModule} from './modules/bid/bid.module';
import {ActivationModule} from './modules/activation/activation.module';

@Module({
  imports: [
    AuthModule,
    FabricConnectorModule,
    ReadinessProbeModule,
    SiteModule,
    PowerPlanEnergyScheduleModule,
    EdaModule,
    EdpModule,
    BidModule,
    OrderModule,
    ComptageModule,
    ActivationModule
  ]
})

export class AppModule {}
