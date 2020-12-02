/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, OnInit} from '@angular/core';
import {SessionService} from '../../../services/session/session-service';

@Component({
  selector: 'app-global',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public loggedUser: any;

  public ngOnInit(): void {
    this.loggedUser = SessionService.getSessionUser();
  }
}
