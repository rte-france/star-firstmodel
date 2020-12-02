/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {BehaviorSubject, Observable} from 'rxjs';
import * as jwt_decode from 'jwt-decode';

import {environment} from '../../../environments/environment';


@Injectable()
export class SessionService {

  public static readonly TOKEN_KEY = 'token';
  public static readonly USER_KEY = 'currentUser';
  public onAuthChange: BehaviorSubject<any>;

  public constructor(private http: Http) {
    this.onAuthChange = new BehaviorSubject(null);
  }


  public login(userEmail: string, password: string): Observable<boolean> {
    return this.http
      .post(`${environment.apiUrl}api/auth/login`, {
        userEmail: userEmail,
        password: password
      })
      .catch((error: any) => {
        console.log('auth/login request failed: ', error.json().error);
        return Observable.throw('auth/login request failed');
      })
      .map((res: Response) => {
        if (!res.json().token) {
          return false;
        }

        const token: string = res.json().token;
        const decodedToken = jwt_decode(token);

        if (!decodedToken.user) {
          console.log ('auth/login request failed: incorrect token')
//          return false;
          Observable.throw('auth/login request failed');
        }

        SessionService.setTokenInLocalStorage(token);
        SessionService.setUserInLocalStorage(decodedToken.user);
        this.onAuthChange.next(decodedToken.user);

        return true;

      });
  }


  public logout(): void {
    SessionService.cleanSessionMaterial();
    this.onAuthChange.next(null);
  }



  public static createAuthorizationHeader(): Headers {
    let headers = new Headers();
    headers.append('x-access-token', SessionService.getSessionToken());
    // headers.append('Content-Type', 'application/json');
    return headers;
  }


  public static setUserInLocalStorage(user: any): void {
    localStorage.setItem(SessionService.USER_KEY, JSON.stringify(user));
  }


  public static setTokenInLocalStorage(token: string): void {
    localStorage.setItem(SessionService.TOKEN_KEY, token);
  }


  public static isSessionUp(): boolean {
    return !(
      !localStorage.getItem(SessionService.USER_KEY) ||
      !localStorage.getItem(SessionService.TOKEN_KEY)
    );
  }


  public static getSessionUser(): any {
    return JSON.parse(localStorage.getItem(SessionService.USER_KEY));
  }

  public static getSessionToken(): any {
    return JSON.parse(localStorage.getItem(SessionService.TOKEN_KEY));
  }


  public static isSessionExpired(): boolean {
    let token = localStorage.getItem(SessionService.TOKEN_KEY);
    if (!token) {
      return true;
    }
    let current_time = new Date().getTime() / 1000;

    try {
      let jwt = SessionService.parseJwt(token);
      return current_time > jwt.exp;
    } catch (e) {
      return true;
    }
  }


  // clear token and remove user from local storage to log user out
  public static cleanSessionMaterial(): void {
    localStorage.removeItem(SessionService.USER_KEY);
    localStorage.removeItem(SessionService.TOKEN_KEY);
    localStorage.clear();
  }


  public static parseJwt(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }

  public static getRoles(): Array<string> {
    return JSON.parse(localStorage.getItem('currentUser')).user.roles;
  }

}
