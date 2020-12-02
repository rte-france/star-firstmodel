/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, OnInit} from '@angular/core';
import {SessionService} from '../../../services/session/session-service';

@Component({
  selector: 'app-composition',
  templateUrl: './composition.component.html',
  styleUrls: ['./composition.component.scss']
})
export class CompositionComponent implements OnInit {
  public organizationType: string;
  public company: string;

  public constructor(private _sessionService: SessionService) {}

  public ngOnInit(): void {
    this.getUserRole();
  }

  public isOrganizationType(organizationType: string): boolean {
    return organizationType === this.organizationType;
  }

  public getUserRole(): void {
    this._sessionService.onAuthChange.subscribe((user) => {
      if (user) {
        this.company = user.organizationId;
        this.organizationType = user.organizationType;
      }
    });
  }
}
