/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@nestjs/common';

@Injectable()
export class ReadinessProbeService {
  public ready(): string {
    return 'Ready!';
  }
}
