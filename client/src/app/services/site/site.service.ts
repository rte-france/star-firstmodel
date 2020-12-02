/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {HttpRequestUtility} from '../../utilities/HttpRequestUtility';

@Injectable()
export class SiteService {
  public constructor(
    private _http: HttpClient,
    private _httpRequestUtility: HttpRequestUtility
  ) {}

  public getSites(): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}api/site/all`,
      this._httpRequestUtility.setHttpOptions()
    );
  }
}
