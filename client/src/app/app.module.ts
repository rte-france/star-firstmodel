/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SimpleNotificationsModule} from 'angular2-notifications';
import {FileUploadModule} from 'ng2-file-upload';
// import {NgxPermissionsModule} from 'ngx-permissions';
import {BrowserModule} from '@angular/platform-browser';
import {appRoutingProviders, routing} from './app.routing';
import {AppComponent} from './app.component';
import {LoginComponent} from './components/login/login.component';
import {DashboardComponent} from './components/logged-in/dashboard/dashboard.component';
import {HeaderBarComponent} from './components/logged-in/header/header.component';
import {LoginHeaderComponent} from './components/login/login-header/login-header.component';
import {SearchEdaComponent} from './components/logged-in/dashboard/search-eda/search-eda.component';
import {CompositionComponent} from './components/logged-in/composition/composition.component';
import {BidComponent} from './components/logged-in/bid/bid.component';
import {ComptageComponent} from './components/logged-in/comptage/comptage.component';
import {HistoriqueComponent} from './components/logged-in/historique/historique.component';
import {HistoryTableComponent} from './components/logged-in/historique/history-table/history-table';
import {HistoryConsultComponent} from './components/logged-in/dashboard/history-consult/history-consult.component';
import {LoggedInComponent} from './components/logged-in/logged-in.component';
import {AuthGuard} from './guards';
import {LimitToFilterPipe} from './filters/limitToFilter.pipe';
import {KeysPipe} from './filters/keysValuesFilter.pipe';
import {SessionService} from './services/session/session-service';
import {EdaService} from './services/eda/eda-service';
import {GoogleChartsModule} from 'angular-google-charts';
import {ActivationService} from './services/activation/activation-service';
import {HttpClientModule} from '@angular/common/http';
import {NgxFileDropModule} from 'ngx-file-drop';
import {HttpRequestUtility} from './utilities/HttpRequestUtility';
import {ActivationDetailsComponent} from './components/logged-in/historique/history-table/activation-details/activation-details.component';
import {OrderService} from './services/order/OrderService';
import {FileSubmissionService} from './services/fileSubmissionService/fileSubmissionService';
import {TechnicalConstraintComponent} from './components/logged-in/historique/history-table/technical-constraint/technical-constraint.component';
import {BidService} from './services/bid/bid.service';
import {SearchInputUtility} from './utilities/search-input.utility';
import {UserIdleModule} from 'angular-user-idle';
import {EdaViewComponent} from './components/logged-in/composition/eda-view/eda-view.component';
import {SiteViewComponent} from './components/logged-in/composition/site-view/site-view.component';
import {SiteService} from './services/site/site.service';
import {NgMultiSelectDropDownModule} from './utilities/ng-multiselect-dropdown/src';
import {SharedModule} from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    LoginHeaderComponent,
    SearchEdaComponent,
    CompositionComponent,
    BidComponent,
    ComptageComponent,
    HistoriqueComponent,
    HistoryConsultComponent,
    HistoryTableComponent,
    HeaderBarComponent,
    LoggedInComponent,
    LimitToFilterPipe,
    KeysPipe,
    ActivationDetailsComponent,
    TechnicalConstraintComponent,
    EdaViewComponent,
    SiteViewComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    HttpModule,
    HttpClientModule,
    GoogleChartsModule,
    routing,
    SimpleNotificationsModule.forRoot(),
    NgbModule.forRoot(),
    BrowserAnimationsModule,
//    NgxPermissionsModule.forRoot(),
    NgxFileDropModule,
    FileUploadModule,
    UserIdleModule.forRoot({idle: 600, timeout: 300, ping: 120}),
    NgMultiSelectDropDownModule.forRoot()
  ],
  exports: [CompositionComponent, HistoryTableComponent],
  providers: [
    appRoutingProviders,
    SessionService,
    AuthGuard,
    EdaService,
    ActivationService,
    OrderService,
    HttpRequestUtility,
    FileSubmissionService,
    BidService,
    HttpRequestUtility,
    SearchInputUtility,
    SiteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
