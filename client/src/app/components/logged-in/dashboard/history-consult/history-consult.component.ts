/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Component} from '@angular/core';
import {DateTime} from '../../../../utilities/DateTime';
import {ActivationService} from '../../../../services/activation/activation-service';

@Component({
  selector: 'app-history-consult',
  templateUrl: './history-consult.component.html',
  styleUrls: ['./history-consult.component.scss']
})
export class HistoryConsultComponent {
  public dateTime: DateTime;
  public currentMonthName: string;
  public previousMonthName: string;
  public currentMonthIndex: number;

  public constructor(public activationService: ActivationService) {
    this.dateTime = new DateTime();
    this.setMonthNames();
  }

  public setMonthNames(): void {
    this.currentMonthName = this.dateTime.getCurrentMonth();
    this.previousMonthName = this.dateTime.getPreviousMonth();
    this.currentMonthIndex = new Date().getMonth();
  }

  public getMonthByIndex(index: number): string {
    return this.dateTime.getMonthByIndex(index);
  }

  public setMonthIndexes(): number[] {
    // creates an array of numbers that are used to create the month name string using the javascript native Date object
    const monthArray: number[] = [];

    for (let i = 0; i <= 11; i++) {
      monthArray.push(i);
    }

    return monthArray;
  }

  public setSelectedMonth(selectedMonth): void {
    this.activationService.selectedMonth = selectedMonth;
  }
}
