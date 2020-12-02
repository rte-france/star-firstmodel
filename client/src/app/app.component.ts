/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy
} from '@angular/common';
import {SessionService} from './services/session/session-service';
import {UserIdleService} from 'angular-user-idle';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [
    Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy}
  ]
})
export class AppComponent implements OnInit {
  public marginClass = '0px';
  public loggedIn = false;
  public activeSidebar = true;

  constructor(
    private _sessionService: SessionService,
    private _router: Router,
    private _location: Location,
    private userIdle: UserIdleService
  ) {
    this.userIdle.startWatching();

    this.userIdle.onTimerStart().subscribe();

    this.userIdle.onTimeout().subscribe(() => {
      console.log('You have been idle for too long, disconnected.');
      this._sessionService.logout();
      this._router.navigate(['/login']);
    });
  }

  public ngOnInit(): void {
    this._sessionService.onAuthChange.subscribe((user) => {
      this.loggedIn = !!user;
    });

    let loc = this._location.path();
    if (this.loggedIn && (loc === '/login' || loc === '')) {
      this._router.navigate(['./dashboard']);
    }

    setInterval(() => {
      if (SessionService.isSessionExpired()) {
        this._sessionService.logout();
        this._router.navigate(['./login']);
      }
      // TODO show popup alert before deconnexion
    }, 60000);
  }

  public onCollapse(event): void {
    this.marginClass = event;
  }

  public collapsedFromHeader(): void {
    this.activeSidebar = !this.activeSidebar;
  }
}
