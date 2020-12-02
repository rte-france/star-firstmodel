/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {ObservableInput} from 'rxjs/Observable';
import {SessionService} from '../../services/session/session-service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public connectedUser: boolean;
  public showErrorMessage = false;

  public userEmail: string;
  public userPassword: string;

  public constructor(
    private _router: Router,
    private _sessionService: SessionService
  ) {}

  public login(userEmail: string, userPassword: string): void {
    this.showErrorMessage = false;
    this._sessionService
      .login(userEmail, userPassword)
      .catch(
        (err: any, caught: Observable<any>): ObservableInput<any> => {
          this.showErrorMessage = true;
          return Observable.throw(caught);
        }
      )
      .subscribe((result) => {
        if (result) {
          this._router.navigate(['./dashboard']);
          this.showErrorMessage = false;
          this.connectedUser = true;
        } else {
          this.showErrorMessage = true;
        }
      });
  }
}
