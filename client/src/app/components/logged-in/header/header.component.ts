/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import 'rxjs/add/operator/map';
import {SessionService} from '../../../services/session/session-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderBarComponent implements OnInit {
  public userEmail: string;
  public organizationType: string;
  public organization: string;
  public userName: string;

  public constructor(
    private _sessionService: SessionService,
    private _router: Router
  ) {}

  public ngOnInit(): void {
    this._sessionService.onAuthChange.subscribe((user) => {
      if (user) {
        this.organization = user.organizationId.toUpperCase();
        this.organizationType = user.organizationType;
      }
    });
  }

  public hasRole(organizationType: string): boolean {
    return organizationType === this.organizationType;
  }

  public isOrganizationType(organizationType: string): boolean {
    return organizationType === this.organizationType;
  }

  public logoutUser(): void {
    this._sessionService.logout();
    this._router.navigate(['./login']);
  }

  public displayHeader(): boolean {
    return SessionService.isSessionUp() && this._router.url !== '/login';
  }
}
