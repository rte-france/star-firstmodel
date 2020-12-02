/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
  ViewChild
} from '@angular/core';
import {Activation} from '../../../../models/activation';
import {ActivationService} from '../../../../services/activation/activation-service';
import {SessionService} from '../../../../services/session/session-service';
import {OrderService} from '../../../../services/order/OrderService';
import {GraphGenerator} from '../../../../utilities/GraphGenerator';
import {BidService} from '../../../../services/bid/bid.service';
import {FileHandler} from '../../../../utilities/FileHandler';
import {DateTime} from '../../../../utilities/DateTime';
import {LogOrder} from '../../../../models/LogOrder';
import {graphConfiguration} from './GraphConfiguration';
import {ActivationDetailsComponent} from './activation-details/activation-details.component';
import {Eda} from '../../../../models/eda';
import {ISubscription} from 'rxjs/Subscription';
import {EdaService} from '../../../../services/eda/eda-service';

@Component({
  selector: 'app-history-table',
  templateUrl: './history-table.html',
  styleUrls: ['./history-table.scss']
})
export class HistoryTableComponent implements OnInit, OnDestroy {
  @Input()
  public dateFilterStartDate: string;

  @Input()
  public dateFilterEndDate: string;

  @Input()
  public filterTable;

  @Output()
  public selectedActivation: EventEmitter<Activation> = new EventEmitter();

  @ViewChild(ActivationDetailsComponent) child;

  public company: string;
  public userName: string;
  public eda: Eda;
  public allEdas: Eda[];
  public activations: Activation[] = [];
  public activation: Activation;
  public filteredActivations: Activation[];
  public getEDASSubscription: ISubscription;
  public isSpinnerActive: boolean;

  public constructor(
    private _activationService: ActivationService,
    private _orderService: OrderService,
    private _bidService: BidService,
    private _sessionService: SessionService,
    private _edaService: EdaService
  ) {
    this.isSpinnerActive = true;
  }

  public ngOnInit(): void {
    this.getActivations();
    this.getUserRole();
    this.getAllEdas();
  }

  public getActivations(): void {
    this._activationService.getActivations().subscribe((response) => {
      this.isSpinnerActive = false;
      this.activations = response;

      if (this.activations.length) {
        this.activations.forEach((activation) =>
          this._activationService.filterActivation(activation)
        );

        if (this._activationService.selectedMonth) {
          const year = new Date().getFullYear();
          const selectedMontStart: Date = new Date(
            year,
            this._activationService.selectedMonth
          );
          const selectedMonthEnd: Date = new Date(
            year,
            this._activationService.selectedMonth + 1
          );

          this.filterActivations(selectedMontStart, selectedMonthEnd);
          this._activationService.selectedMonth = undefined;
        } else {
          this.filteredActivations = response;
        }
      } else {
        this.filteredActivations = response;
      }
    });
  }

  public hasFilterTableItem(itemName: string): boolean {
    for (const item of this.filterTable) {
      if (item.item_text === itemName) {
        return true;
      }
    }

    return false;
  }

  public getUserRole(): void {
    this._sessionService.onAuthChange.subscribe((user) => {
      if (user) {
        this.company = user.organizationType;
      }
    });
  }

  public createGraph(activation: Activation): void {
    this.activateSelection(activation);
    graphConfiguration.width = 1400;

    new GraphGenerator(this._activationService).generate(
      activation,
      this.company
    );
  }

  public toggleActivationDetails(activation: Activation): void {
    this.selectedActivation.emit(activation);
  }

  public activateSelection(activation: Activation): void {
    this.activation = activation;
    if (this.activation.selected) {
      this.activation.selected = false;

      return;
    }

    for (const selectedActivation of this.activations) {
      selectedActivation.selected = false;
    }

    this.activation.selected = !this.activation.selected;
  }

  public isCompany(company: string): boolean {
    return company === this.company;
  }

  public filterActivations(
    selectedStartDate?: Date,
    selectedEndDate?: Date
  ): void {
    let startDate: Date = selectedStartDate;
    let endDate: Date = selectedEndDate;

    if (!selectedStartDate && !selectedEndDate) {
      startDate = this.setStartDate(this.dateFilterStartDate);
      endDate = this.setEndDate(this.dateFilterEndDate);
    }

    if (!this.isDateValid(startDate) && !this.isDateValid(endDate)) {
      this.filteredActivations = this.activations;

      return;
    }

    if (!this.isDateValid(startDate) && this.isDateValid(endDate)) {
      this.filteredActivations = this.activations.filter(
        (activation: Activation) => {
          const activationDate = new Date(activation.date);

          return activationDate <= endDate;
        }
      );

      return;
    }

    if (this.isDateValid(startDate) && !this.isDateValid(endDate)) {
      this.filteredActivations = this.activations.filter(
        (activation: Activation) => {
          const activationDate = new Date(activation.date);

          return activationDate >= startDate;
        }
      );

      return;
    }

    this.filteredActivations = this.activations.filter(
      (activation: Activation) => {
        const activationDate = new Date(activation.date);

        return activationDate >= startDate && activationDate <= endDate;
      }
    );

    return;
  }

  public downloadBid(bidRegisteredResourceMrid: string) {
    this._bidService
      .getBidByBidRegisteredResourceMrid(bidRegisteredResourceMrid)
      .subscribe((response) => {
        new FileHandler().download(response.results);
      });
  }

  public setStartDate(startDate: any): Date {
    return new Date(startDate);
  }

  public setEndDate(endDate: any): Date {
    return new Date(endDate);
  }

  public isDateValid(date: any): boolean {
    return new DateTime().isDateValid(date);
  }

  public findLogOrderDateByType(logOrders: LogOrder[], type: string): string {
    const logOrderFound: LogOrder = logOrders.find(
      (log: LogOrder) => log.type === type
    );

    if (logOrderFound) {
      return new DateTime().createTimeStampInShortFormat(
        logOrderFound.logOrderTimestamp
      );
    } else {
      return '';
    }
  }

  public async getAllEdas(): Promise<void> {
    this.getEDASSubscription = await this._edaService
      .getEDAs()
      .subscribe((EDAs: Eda[]) => {
        this.allEdas = EDAs;
      });
  }

  public ngOnDestroy(): void {
    if (this.activation) {
      this.activation.selected = false;
    }
  }
}
