/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {saveAs} from 'file-saver';
import {Bid} from '../models/Bid';

export class FileHandler {
  public constructor() {}

  public download(bid: Bid[]): void {
    const bidBinary = new Blob([JSON.stringify(bid)]);

    saveAs(bidBinary, `bid_${bid[0].bidRegisteredResourceMrid}.json`);
  }
}
