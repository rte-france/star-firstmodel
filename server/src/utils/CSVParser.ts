/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import * as csv from 'csvtojson';

export class CSVParser {
  public static async parse<Type>(csvFilePath: string): Promise<Type[]> {
    return csv({
      checkType: true,
      ignoreEmpty: true,
      delimiter: 'auto'
    }).fromFile(csvFilePath);
  }
}
