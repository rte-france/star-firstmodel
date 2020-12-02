/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Activation} from '../../../../../models/activation';
import {ActivationService} from '../../../../../services/activation/activation-service';
import {graphConfiguration} from '../GraphConfiguration';
import {LogOrder} from '../../../../../models/LogOrder';
import {DateTime} from '../../../../../utilities/DateTime';
import {FileHandler} from '../../../../../utilities/FileHandler';
import {BidService} from '../../../../../services/bid/bid.service';
import {ISubscription} from 'rxjs/Subscription';
import {OrderService} from '../../../../../services/order/OrderService';
import {EdaService} from '../../../../../services/eda/eda-service';
import {Eda} from '../../../../../models/eda';
import {Site} from '../../../../../models/site';
import {Order} from '../../../../../models/Order';
import {SessionService} from '../../../../../services/session/session-service';

@Component({
  selector: 'app-activation-details',
  templateUrl: './activation-details.component.html',
  styleUrls: ['./activation-details.component.scss']
})
export class ActivationDetailsComponent implements OnInit {
  @Input()
  public selectedActivation: Activation;

  @Output()
  public isActivationDetailsComponentClosed: EventEmitter<
    boolean
  > = new EventEmitter();

  public columns: TableColumn[] = [];
  public eda: Eda;
  public allOrders: Order[];
  public selectedOrder: Order;
  public siteName: string;
  public siteId: string;
  public siteNameResult: string;
  public getEDASSubscription: ISubscription;
  public getOrderBySiteSubscription: ISubscription;
  public siteResults: Site[] = [];
  public allSites = [];
  public company: string;

  public constructor(
    private _activationService: ActivationService,
    private _bidService: BidService,
    private _orderService: OrderService,
    private _edaService: EdaService,
    private _sessionService: SessionService
  ) {}

  public async ngOnInit(): Promise<void> {
    this.getUserRole();
    this.setAttributes();
    this.createGraph(this.selectedActivation);
    await this.getOrders();
    await this.getAllSitesByedaRegisteredResourceId();
  }

  public setAttributes(): void {
    this.selectedActivation = this._activationService.filterActivation(
      this.selectedActivation
    );
    this.columns = this.initTableColumns(this.selectedActivation);
  }

  public getUserRole(): void {
    this._sessionService.onAuthChange.subscribe((user) => {
      if (user) {
        this.company = user.organizationType;
      }
    });
  }

  public closeActivationDetailsComponent(): void {
    this.isActivationDetailsComponentClosed.emit(true);
  }

  public isCompany(company: string): boolean {
    return company === this.company;
  }

  public createGraph(activation: Activation): void {
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    // assignment to a variable is needed because calling the check in a nested function breaks the this. context
    const isPowerPlanEnergyScheduleDataAvailable: boolean = this.isPowerPlanEnergyScheduleDataAvailable(
      activation
    );

    const plotData = this._activationService.setActivationGraphData(
      activation,
      isPowerPlanEnergyScheduleDataAvailable,
      this.company
    );

    function drawChart() {
      const data = new google.visualization.DataTable();

      data.addColumn('string', 'Time');
      data.addColumn({
        type: 'string',
        role: 'tooltip',
        p: {
          html: true
        }
      });

      if (isPowerPlanEnergyScheduleDataAvailable) {
        data.addColumn('number', 'PA');
      } else {
        data.addColumn('number', '');
      }

      data.addColumn('number', 'Ordre');
      data.addColumn('number', 'Télérelevé');
      data.addRows(plotData);

      const chart = new google.visualization.SteppedAreaChart(
        document.getElementById(activation.bspOrganizationId)
      );

      graphConfiguration.width = 1100;

      chart.draw(data, graphConfiguration);
    }
  }

  public downloadBid(bidRegisteredResourceMrid: string) {
    this._bidService
      .getBidByBidRegisteredResourceMrid(bidRegisteredResourceMrid)
      .subscribe((response) => {
        new FileHandler().download(response.results);
      });
  }

  public isPowerPlanEnergyScheduleDataAvailable(
    activation: Activation
  ): boolean {
    return activation.dataPowerPlanEnergySchedule.length !== 0;
  }

  public dateParser(timeStamp: string): string {
    const date: DateTime = new DateTime();

    return date.createTimeStampInShortFormat(timeStamp);
  }

  public findLogOrderDateByType(logOrders: LogOrder[], type: string): string {
    const logOrderFound: LogOrder = logOrders.find(
      (log: LogOrder) => log.type === type
    );

    return new DateTime().createTimeStampInShortFormat(
      logOrderFound.logOrderTimestamp
    );
  }

  public initTableColumns(activation: Activation): TableColumn[] {
    const tableValue: TableColumn[] = [];
    let dataPowerPlanEnergyScheduleQuantity = null;

    if (activation.dataPowerPlanEnergySchedule.length > 0) {
      dataPowerPlanEnergyScheduleQuantity =
        activation.dataPowerPlanEnergySchedule[0].quantity;
    }

    // Init table with first Value
    let tableColumnLastElement: TableColumn = new TableColumn(
      activation.timeSeries[0].timeStampStart,
      dataPowerPlanEnergyScheduleQuantity,
      activation.siteOrder.toString(),
      activation.timeSeries[0].quantity
    );
    tableValue.push(tableColumnLastElement);

    for (let i = 1; i < activation.timeSeries.length; i++) {
      if (
        (activation.dataPowerPlanEnergySchedule[i] &&
          activation.dataPowerPlanEnergySchedule[i].quantity !==
            tableColumnLastElement.programmedValue) ||
        activation.timeSeries[i].quantity !== tableColumnLastElement.valueHT
      ) {
        if (activation.dataPowerPlanEnergySchedule[i]) {
          dataPowerPlanEnergyScheduleQuantity =
            activation.dataPowerPlanEnergySchedule[i].quantity;
        }

        const tableColumn: TableColumn = new TableColumn(
          activation.timeSeries[i].timeStampStart,
          dataPowerPlanEnergyScheduleQuantity,
          activation.siteOrder.toString(),
          activation.timeSeries[i].quantity
        );
        tableColumnLastElement = tableColumn;
        tableValue.push(tableColumn);
      }

      if (i === activation.timeSeries.length - 1) {
        if (activation.dataPowerPlanEnergySchedule[i]) {
          dataPowerPlanEnergyScheduleQuantity =
            activation.dataPowerPlanEnergySchedule[i].quantity;
        } else {
          dataPowerPlanEnergyScheduleQuantity = '-';
        }

        const tableColumn: TableColumn = new TableColumn(
          activation.timeSeries[i].timeStampStart,
          dataPowerPlanEnergyScheduleQuantity,
          activation.siteOrder.toString(),
          activation.timeSeries[i].quantity
        );
        tableValue.push(tableColumn);
      }
    }

    return tableValue;
  }

  public async getOrders(): Promise<void> {
    await this._orderService.getOrderActivationDocuments();
    this.allOrders = this._orderService.orders;

    this.getSelectedOrder(this.selectedActivation);
  }

  public async setSiteName(): Promise<void> {
    this.getOrderBySiteSubscription = await this._orderService
      .getOrderBySiteActivationDocument()
      .subscribe((ordersBySite: any[]) => {
        for (let orderBySite of ordersBySite) {
          if (
            orderBySite.idOrderBySite === this.selectedActivation.siteOrderId
          ) {
            this.siteId = orderBySite.siteId;

            for (let site of this.allSites) {
              if (site.siteId === this.siteId) {
                this.siteNameResult = site.siteName;
              }
            }
          }
        }
      });
  }

  public async getAllSitesByedaRegisteredResourceId(): Promise<void> {
    this.getEDASSubscription = await this._edaService
      .getEDAs()
      .subscribe((EDAs: Eda[]) => {
        for (const eda of EDAs) {
          this.getEDASSubscription = this._edaService
            .getSitesByedaRegisteredResourceId(eda.edaRegisteredResourceId)
            .subscribe((sites: Site[]) => {
              for (let site of sites) {
                this.allSites.push(site);
              }
              if (this.siteNameResult === undefined) {
                this.setSiteName();
              }
              this.getSiteResults();
            });
        }
      });
  }

  public async getSiteResults(): Promise<void> {
    this.siteResults = [];

    if (
      this.selectedOrder &&
      this.selectedOrder.objectAggregationMeteringPoint
    ) {
      for (const orderCodePRM of this.selectedOrder
        .objectAggregationMeteringPoint) {
        for (const site of this.allSites) {
          if (orderCodePRM === site.objectAggregationMeteringPoint) {
            this.siteResults.push(site);
          }
        }
      }
    }
  }

  public getSelectedOrder(selectedActivation: Activation): void {
    for (let order of this.allOrders) {
      if (selectedActivation.nazaOrderId === order.orderId) {
        this.selectedOrder = order;
      }
    }
  }
}

class TableColumn {
  public constructor(
    public startTime: string,
    public programmedValue: string,
    public expectedValue: string,
    public valueHT: string
  ) {}
}
