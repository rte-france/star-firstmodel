/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/



import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

import {AuthService} from '../modules/authentication/auth.service';
import {Log} from '../common/utils/logging/Log';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private authService: AuthService
  ) {}
    
  public canActivate (context: ExecutionContext): boolean {

    const request = context.switchToHttp().getRequest();
    
    let token: string;
    if (context.switchToHttp().getRequest().headers['x-access-token']) {
      token = context.switchToHttp().getRequest().headers['x-access-token'];
    }
    if (context.switchToHttp().getRequest().headers.authorization) {
      token = context.switchToHttp().getRequest().headers.authorization;
    }
    
    // If "Bearer " in front of token (e.g. Swagger) => remove
    this.authService.setToken(this.trimBearerFromToken(token));
    
    return this.authService.validateUserPermission();
  }


  private trimBearerFromToken(token: string): string {
    if (token.startsWith('Bearer ')) {
      return token.slice(7, token.length).trimLeft();
    }
    else {
      return token;
    }
  }

 
}
