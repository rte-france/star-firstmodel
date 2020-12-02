/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {OrderBySiteActivationDocument} from '../../../models/OrderBySiteActivationDocument';

export interface IOrderBySiteActivationDocumentService {
  createOrderBySiteActivationDocument(
    orderBySiteActivationDocuments: OrderBySiteActivationDocument[]
  ): Promise<any>;
}
