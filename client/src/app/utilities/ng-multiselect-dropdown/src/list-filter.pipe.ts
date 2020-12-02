/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Pipe, PipeTransform} from '@angular/core';
import {ListItem} from './multiselect.model';

@Pipe({
  name: 'multiSelectFilter',
  pure: false
})
export class ListFilterPipe implements PipeTransform {
  transform(items: ListItem[], filter: ListItem): ListItem[] {
    if (!items || !filter) {
      return items;
    }

    return items.filter((item: ListItem) => this.applyFilter(item, filter));
  }

  applyFilter(item: any, filter: any): boolean {
    if (typeof item.text === 'string' && typeof filter.text === 'string') {
      return !(
        filter.text &&
        item.text &&
        item.text.toLowerCase().indexOf(filter.text.toLowerCase()) === -1
      );
    } else {
      return !(
        filter.text &&
        item.text &&
        item.text
          .toString()
          .toLowerCase()
          .indexOf(filter.text.toString().toLowerCase()) === -1
      );
    }
  }
}
