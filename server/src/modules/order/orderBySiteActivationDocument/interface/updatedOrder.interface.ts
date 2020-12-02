/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {OrderActivationDocument} from '../../../../models/OrderActivationDocument';
import {OrderBySiteActivationDocument} from '../../../../models/OrderBySiteActivationDocument';

export class UpdatedOrder {
  public orderActivationDocument: OrderActivationDocument;
  public orderBySiteActivationDocumentList: OrderBySiteActivationDocument[];
}
