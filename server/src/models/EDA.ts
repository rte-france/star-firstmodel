/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import * as uuidv4 from 'uuid/v4';
import {EDADto} from '../modules/eda/dto/EDADto';

export class EDA {
  public constructor(
    public edaRegisteredResourceId: string,
    public a46Name: string,
    public edaRegisteredResourceName: string,
    public edaRegisteredResourceMrid: string,
    public a46IEC: string
  ) {}

  public static postEDAFromJSON(eda: EDADto): EDA {
    return new EDA(
      'eda_' + uuidv4(),
      eda.a46Name,
      eda.edaRegisteredResourceName,
      eda.edaRegisteredResourceMrid,
      eda.a46IEC
    );
  }
}
