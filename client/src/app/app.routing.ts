/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards';
import {LoginComponent} from './components/login/login.component';
import {DashboardComponent} from './components/logged-in/dashboard/dashboard.component';
import {ComptageComponent} from './components/logged-in/comptage/comptage.component';
import {CompositionComponent} from './components/logged-in/composition/composition.component';
import {BidComponent} from './components/logged-in/bid/bid.component';
import {HistoriqueComponent} from './components/logged-in/historique/historique.component';
import {SearchEdaComponent} from './components/logged-in/dashboard/search-eda/search-eda.component';
import {LoggedInComponent} from './components/logged-in/logged-in.component';

const appRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'search-eda',
    component: SearchEdaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'logged-in',
    component: LoggedInComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'comptage',
    component: ComptageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'composition',
    component: CompositionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'offre',
    component: BidComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'historique',
    component: HistoriqueComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
