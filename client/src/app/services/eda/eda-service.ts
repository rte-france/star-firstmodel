/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpRequestUtility} from '../../utilities/HttpRequestUtility';

@Injectable()
export class EdaService {
  public constructor(
    private _http: HttpClient,
    private _httpRequestUtility: HttpRequestUtility
  ) {}

  public getEDAs(): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}api/eda/all`,
      this._httpRequestUtility.setHttpOptions()
    );
  }

  public getSitesByedaRegisteredResourceId(
    edaRegisteredResourceId: string
  ): Observable<any> {
    return this._http.get(
      environment.apiUrl +
        'api/site?edaRegisteredResourceId=' +
        edaRegisteredResourceId,
      this._httpRequestUtility.setHttpOptions()
    );
  }

  public getEDPBySiteID(siteId: string): Observable<any> {
    return this._http.get(
      environment.apiUrl + 'api/edp?siteId=' + siteId,
      this._httpRequestUtility.setHttpOptions()
    );
  }
}
