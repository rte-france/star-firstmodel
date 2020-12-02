/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpRequestUtility} from '../../utilities/HttpRequestUtility';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable()
export class BidService {
  public constructor(
    private _http: HttpClient,
    private _httpRequestUtility: HttpRequestUtility
  ) {}

  public getBidByBidRegisteredResourceMrid(
    bidRegisteredResourceMrid: string
  ): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}api/bid?bidRegisteredResourceMrid=${bidRegisteredResourceMrid}`,
      this._httpRequestUtility.setHttpOptions()
    );
  }
}
