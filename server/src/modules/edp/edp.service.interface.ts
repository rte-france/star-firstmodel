/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {EDPDto} from './dto/EDPDto';
import {EDP} from '../../models/EDP';

export interface IEDPService {
  createEDP(edp: EDPDto): Promise<any>;

  getEDPById(id: string): Promise<EDP>;

  queryEDP(edp: EDPDto): Promise<EDP>;

  updateEDP(edp: EDPDto): Promise<any>;
}
