/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export class DateTime {
  public getCurrentMonth(): string {
    const monthNumber = new Date().getMonth();
    const currentDate = new Date(null, monthNumber);

    return currentDate.toLocaleString('fr', {month: 'long'});
  }

  public getPreviousMonth(): string {
    const currentMonth: number = new Date().getMonth();
    const previousMonthNumber = new Date(null, currentMonth - 1).getMonth();
    const previousMonth = new Date(null, previousMonthNumber);

    return previousMonth.toLocaleString('fr', {month: 'long'});
  }

  public getMonthByIndex(index: number): string {
    const currentDate = new Date(null, index);

    return currentDate.toLocaleString('fr', {month: 'long'});
  }

  public createTimeStampInShortFormat(timeStamp: string): string {
    if (!timeStamp) {
      return;
    }

    const date = new Date(Number(timeStamp) * 1000);

    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  public isDateValid(date: any): boolean {
    let isDateValid: boolean;

    if (Object.prototype.toString.call(date) === '[object Date]') {
      isDateValid = !isNaN(date.getTime());
    } else {
      isDateValid = false;
    }

    return isDateValid;
  }
}
