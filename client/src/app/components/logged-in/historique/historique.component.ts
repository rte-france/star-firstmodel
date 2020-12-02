/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component, OnInit, ViewChild} from '@angular/core';
import {Activation} from '../../../models/activation';
import {HistoryTableComponent} from './history-table/history-table';
import {Router} from '@angular/router';
import {SessionService} from '../../../services/session/session-service';
import {Organization} from '../../common/Organization';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.scss']
})
export class HistoriqueComponent implements OnInit {
  @ViewChild(HistoryTableComponent)
  public historyTableComponent: HistoryTableComponent;

  public shouldActivationDetailsBeDisplayed: boolean;
  public selectedActivation: Activation;
  public dateFilterStartDate: any;
  public dateFilterEndDate: any;
  public dropdownList = [];
  public defaultSelectedItems = [];
  public selectedItems = [];
  public dropdownSettings = {};
  public filterTable = [];
  public organizationType: string;
  public organization: string;

  public constructor(
    private _sessionService: SessionService,
    private _router: Router
  ) {
    this.dropdownList = [
      {item_id: 1, item_text: 'Code / Name BSP'},
      {item_id: 2, item_text: 'Site'},
      {item_id: 3, item_text: 'Date'},
      {item_id: 5, item_text: 'Site Puissance'},
      {item_id: 6, item_text: 'Ordre site reçu'},
      {item_id: 7, item_text: 'Heure de début'},
      {item_id: 8, item_text: 'Heure ordre de fin'},
      {item_id: 12, item_text: 'Tech. constraint'}
    ];
  }

  public ngOnInit(): void {
    this._sessionService.onAuthChange.subscribe((user) => {
      if (user) {
        this.organization = user.organizationId.toUpperCase();
        this.organizationType = user.organizationType;
      }
    });

    this.setDropdownSettings();
    this.constructDefaultSelectedItems();
    this.constructDropdownListPerOrganization();
    this.selectedItems = this.defaultSelectedItems;
    this.filterTable = this.selectedItems;
  }

  public onItemSelect(item: any): void {
    this.filterTable = [...this.filterTable, item];
  }

  public onItemDeSelect(item: any): void {
    if (this.filterTable.length > 0) {
      const itemIndex: number = this.filterTable.findIndex(
        (itemInFilterTable) => itemInFilterTable.item_text === item.item_text
      );

      if (itemIndex !== -1) {
        this.filterTable.splice(itemIndex, 1);
      }
    }
  }

  public onOpenActivationDetails(activation: Activation): void {
    this.shouldActivationDetailsBeDisplayed = true;
    this.selectedActivation = activation;
  }

  public onCloseActivationDetails(): void {
    this.shouldActivationDetailsBeDisplayed = false;
  }

  public onSubmitStartDate(startDate: any): void {
    this.dateFilterStartDate = startDate;
  }

  public onSubmitEndDate(endDate: any): void {
    this.dateFilterEndDate = endDate;
  }

  public filterActivations(): void {
    this.historyTableComponent.filterActivations();
  }

  public redirect(): void {
    this._router.navigate(['./composition']);
  }

  private constructDropdownListPerOrganization(): void {
    if (Organization.isTSOType(this.organizationType)) {
      this.dropdownList = [
        ...this.dropdownList,
        {
          item_id: 4,
          item_text: 'NAZA Puissance'
        },
        {
          item_id: 9,
          item_text: 'Ref. Offre'
        }
      ];
    }

    if (!Organization.isProducerType(this.organizationType)) {
      this.dropdownList = [
        ...this.dropdownList,
        {
          item_id: 11,
          item_text: 'NazaOrderId'
        }
      ];
    }

    this.dropdownList = [
      ...this.dropdownList,
      {
        item_id: 10,
        item_text: 'OrderBySite id'
      }
    ];

    this.dropdownList.sort((a, b) => this.sortList(a, b));
  }

  private sortList(a, b): number {
    if (a.item_id < b.item_id) {
      return -1;
    }
    if (a.item_id > b.item_id) {
      return 1;
    }
    return 0;
  }

  private constructDefaultSelectedItems(): void {
    this.defaultSelectedItems = this.dropdownList;

    if (Organization.isTSOType(this.organizationType)) {
      this.defaultSelectedItems = [
        ...this.dropdownList,
        {item_id: 9, item_text: 'Ref. Offre'}
      ];
    }
  }

  private setDropdownSettings(): void {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      allowSearchFilter: false,
      enableCheckAll: false,
      maxHeight: '190',
      itemsShowLimit: 0,
      limitSelection: 9
    };
  }
}
