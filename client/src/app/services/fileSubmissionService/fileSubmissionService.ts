/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HttpRequestUtility} from '../../utilities/HttpRequestUtility';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable()
export class FileSubmissionService {
  public accessTokenHeaderName = 'token';
  public constructor(
    private _http: HttpClient,
    private httpRequestUtility: HttpRequestUtility
  ) {}

  public postNewCSVBid(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('csv', file, file.name);

    return this._http.post(
      `${environment.apiUrl}api/bid/csv-upload`,
      formData,
      this.httpRequestUtility.setMultiPartOptions()
    );
  }

  public postNewCSVMV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('csv', file, file.name);

    return this._http.post(
      `${environment.apiUrl}api/comptage/MV/csv-upload`,
      formData,
      this.httpRequestUtility.setMultiPartOptions()
    );
  }

  public postNewCSVHV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('csv', file, file.name);

    return this._http.post(
      `${environment.apiUrl}api/comptage/HV/csv-upload`,
      formData,
      this.httpRequestUtility.setMultiPartOptions()
    );
  }

  public postNewCSVPowerPlanEnergySchedule(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('csv', file, file.name);

    return this._http.post(
      `${environment.apiUrl}api/powerPlanEnergySchedule/csv-upload`,
      formData,
      this.httpRequestUtility.setMultiPartOptions()
    );
  }

  private getToken(): string {
    return localStorage.getItem(this.accessTokenHeaderName);
  }
}
