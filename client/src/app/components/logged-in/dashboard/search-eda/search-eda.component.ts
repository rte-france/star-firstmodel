/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {SearchInputUtility} from '../../../../utilities/search-input.utility';

@Component({
  selector: 'app-search-eda',
  templateUrl: './search-eda.component.html',
  styleUrls: ['./search-eda.component.scss']
})
export class SearchEdaComponent {
  public searchInput: string | number;

  public constructor(
    private _router: Router,
    private _searchInputUtility: SearchInputUtility
  ) {}

  public passValue() {
    this._searchInputUtility.changeObject(this.searchInput);
    this._router.navigate(['./composition']);
  }
}
