/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Module} from '@nestjs/common';
import {AuthModule} from '../authentication/auth.module';
import {FabricConnectorModule} from '../fabric-connector/fabric-connector.module';
import {OrderActivationDocumentController} from './orderActivationDocument/orderActivationDocument.controller';
import {OrderActivationDocumentService} from './orderActivationDocument/orderActivationDocument.service';
import {SiteModule} from '../site/site.module';
import {OrderBySiteActivationDocumentService} from './orderBySiteActivationDocument/orderBySiteActivationDocument.service';
import {OrderBySiteActivationDocumentController} from './orderBySiteActivationDocument/orderBySiteActivationDocument.controller';

@Module({
  imports: [AuthModule, FabricConnectorModule, SiteModule],
  controllers: [
    OrderActivationDocumentController,
    OrderBySiteActivationDocumentController
  ],
  providers: [
    OrderActivationDocumentService,
    OrderBySiteActivationDocumentService
  ]
})
export class OrderModule {}
