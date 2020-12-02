/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpRequestUtility} from '../../utilities/HttpRequestUtility';
import {LogOrder} from '../../models/LogOrder';
import {Order} from '../../models/Order';

@Injectable()
export class OrderService {
  public orders: Order[];

  public constructor(
    private _http: HttpClient,
    private _httpRequestUtility: HttpRequestUtility
  ) {}

  public async getOrderActivationDocuments(): Promise<any> {
    const requestUrl = `${environment.apiUrl}api/orderActivationDocument/all`;

    await fetch(requestUrl)
      .then((response) => {
        return response.json();
      })
      .then((allOrders) => {
        this.orders = allOrders;
      });
  }

  public getOrderBySiteActivationDocument(): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}api/order/orderBySiteActivationDocument`,
      this._httpRequestUtility.setHttpOptions()
    );
  }

  public getOrderBySiteActivationDocumentById(
    orderBySiteId: string
  ): Observable<any> {
    return this._http.get(
      `${environment.apiUrl}api/order/orderBySiteActivationDocument/orderBySiteActivationDocumentId/${orderBySiteId}`,
      this._httpRequestUtility.setHttpOptions()
    );
  }

  public reportTechnicalConstraint(
    logOrder: LogOrder,
    orderBySiteId: string
  ): Observable<any> {
    const requestUrl = `${environment.apiUrl}api/order/orderBySiteActivationDocument/${orderBySiteId}/logOrder`;

    return this._http.put(
      requestUrl,
      logOrder,
      this._httpRequestUtility.setHttpOptions()
    );
  }
}
