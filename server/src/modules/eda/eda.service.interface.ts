/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {EDA} from '../../models/EDA';
import {EDADto} from './dto/EDADto';

export interface IEDAService {
  createEDA(eda: EDADto): Promise<EDA>;

  getAllEDAs(): Promise<EDA[]>;

  getEDAbyId(id: string): Promise<EDA>;

  queryEDA(eda: EDA): Promise<EDA>;

  updateEDA(eda: EDA): Promise<EDA>;
}
