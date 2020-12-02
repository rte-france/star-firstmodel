/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {HVDto} from '../dto/HVDto';
import {HV} from '../../../models/HV';

export interface IComptageHVService {
  createComptageHV(hv: HVDto): Promise<HV>;

  createHVFromCSV(hv: HVDto[]): Promise<string[] | object>;

  getComptageHVyId(id: string): Promise<HV>;

  queryComptageHV(hv: HVDto): Promise<HV>;

  updateComptageHV(hv: HVDto): Promise<HV>;
}
