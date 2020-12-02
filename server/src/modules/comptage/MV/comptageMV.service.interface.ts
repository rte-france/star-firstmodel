/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {MVDto} from '../dto/MVDto';
import {MV} from '../../../models/MV';

export interface IComptageMVService {
  createComptageMV(mv: MVDto): Promise<MV>;

  createMVFromCSV(mv: MVDto[]): Promise<string[] | object>;

  getComptageMVById(id: string): Promise<MV>;

  queryComptageMV(mv: MVDto): Promise<MV>;

  updateComptageMV(mv: MVDto): Promise<MV>;
}
