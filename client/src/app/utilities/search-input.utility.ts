/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class SearchInputUtility {
  public searchInput: any = new BehaviorSubject({});
  public newSearchInput: any = this.searchInput.asObservable();

  public changeObject(value: any): any {
    this.searchInput.next(value);
  }
}
