/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export class HttpRequestUtility {
  public accessTokenHeaderName = 'token';

  public setHttpOptions(): any {
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': this.getToken()
      }
    };
  }

  public setMultiPartOptions(): any {
    return {
      headers: {
        'x-access-token': this.getToken()
      }
    };
  }

  public getToken(): string {
    return localStorage.getItem(this.accessTokenHeaderName);
  }
}
