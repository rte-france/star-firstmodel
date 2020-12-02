/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot} from '@angular/router';
// import {NgxPermissionsService} from 'ngx-permissions';
import {SessionService} from '../services/session/session-service';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
//    private _ngxPermissionsService: NgxPermissionsService,
    private router: Router
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    if (SessionService.isSessionUp() && !SessionService.isSessionExpired()) {
      return Promise.resolve(true);
    } else {
      this.router.navigateByUrl('/login');
      return Promise.resolve(false);
    }
  }
}
