/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'limitToFilter'
})
export class LimitToFilterPipe implements PipeTransform {
  transform(value: any, args: string): string {
    let limit = args ? parseInt(args, 10) : 10;

    return value.length > limit ? value.splice(0, limit) : value;
  }
}
