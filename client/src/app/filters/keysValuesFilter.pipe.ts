/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'keys'
})
export class KeysPipe implements PipeTransform {
  transform(value, args: string[]): any {
    if (!value) {
      return value;
    }

    let objects = [];
    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        objects.push({key: Number(key).toFixed(2), value: value[key]});
      }
    }

    objects.sort((a, b) => {
      return a.key - b.key;
    });
    return objects;
  }
}
