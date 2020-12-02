/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpRequestUtility} from '../../utilities/HttpRequestUtility';
import {Activation} from '../../models/activation';
import {DateTime} from '../../utilities/DateTime';
import {Point} from '../../models/Point';
import {OrderValueRange} from '../../models/OrderBySite';

@Injectable()
export class ActivationService {
  /**
   * Margin adjust the number of point taken from the point list
   * Basically take 4 point Before + order duration + 4 point after
   * Only usage is for displaying confort on graph
   * (4 * 300s) = 20 minutes
   */
  public selectedMonth: number;
  public isPowerPlanEnergyScheduleDataAvailable: boolean;

  public constructor(
    private _http: HttpClient,
    private httpRequestUtility: HttpRequestUtility
  ) {}

  public getActivations(): Observable<any> {
    const requestUrl = `${environment.apiUrl}api/activations/all`;

    return this._http.get(requestUrl, this.httpRequestUtility.setHttpOptions());
  }

  public filterActivation(activation: Activation): Activation {
    activation.nazaOrder = this.replaceOrderValue(activation.nazaOrder);
    activation.siteOrder = this.replaceOrderValue(activation.siteOrder);

    return activation;
  }

  // TODO remove method when value is different from O and 1 only
  public replaceOrderValue(orderValue: number): number {
    if (
      orderValue === OrderValueRange.NOTHING ||
      orderValue === OrderValueRange.ALL
    ) {
      return 0;
    } else {
      return -1;
    }
  }

  public setActivationGraphData(
    activation: Activation,
    isPowerPlanEnergyScheduleDataAvailable: boolean,
    company: string
  ): any[][] {
    const graphPoint: any[] = [];

    this.isPowerPlanEnergyScheduleDataAvailable = isPowerPlanEnergyScheduleDataAvailable;
    for (let i = 0; i < activation.timeSeries.length; i++) {
      // index on the two list of point
      let data: any[];

      if (
        this.isPowerPlanEnergyScheduleDataAvailable &&
        i < activation.dataPowerPlanEnergySchedule.length
      ) {
        const powerStartTime: number =
          +activation.timeSeries[0].timeStampStart + 3600;
        const powerEndTime: number =
          +activation.timeSeries[activation.timeSeries.length - 1]
            .timeStampEnd - 3600;

        const startPoint: number = +activation.timeSeries[i].timeStampStart;
        const endPoint: number = +activation.timeSeries[i].timeStampEnd;

        if (startPoint < powerStartTime || endPoint > powerEndTime) {
          data = this.createGraphData(
            activation.timeSeries[i],
            undefined,
            company,
            activation.dataPowerPlanEnergySchedule[i]
          );
        } else {
          data = this.createGraphData(
            activation.timeSeries[i],
            activation.siteOrder,
            company,
            activation.dataPowerPlanEnergySchedule[i]
          );
        }
      } else {
        data = this.createGraphData(
          activation.timeSeries[i],
          activation.siteOrder,
          company
        );
      }

      graphPoint.push(data);
    }

    return graphPoint;
  }

  private generateTimeIntervalString(
    powerPlanEnergyScheduleData: Point
  ): string {
    return `${this.createTimeStampInShortFormat(
      powerPlanEnergyScheduleData.timeStampStart
    )} → ${this.createTimeStampInShortFormat(
      powerPlanEnergyScheduleData.timeStampEnd
    )}`;
  }

  private createGraphData(
    htDataPoint: Point,
    siteOrderAmount: number,
    company: string,
    powerPlanEnergyScheduleDataPoint?: Point
  ): any[] {
    const timeInterval: string = this.generateTimeIntervalString(htDataPoint);

    let powerPlanEnergyScheduleData = null;

    let tooltipHTML;
    if (powerPlanEnergyScheduleDataPoint) {
      powerPlanEnergyScheduleData = this.isPowerPlanEnergyScheduleDataAvailable
        ? Number(powerPlanEnergyScheduleDataPoint.quantity)
        : null;
      tooltipHTML = this.createCustomHTMLContent(
        company,
        timeInterval,
        siteOrderAmount,
        Number(htDataPoint.quantity),
        powerPlanEnergyScheduleData
      );
    } else {
      tooltipHTML = this.createCustomHTMLContent(
        company,
        timeInterval,
        siteOrderAmount,
        Number(htDataPoint.quantity),
        '-'
      );
    }

    return [
      this.createTimeStampInShortFormat(htDataPoint.timeStampStart),
      tooltipHTML,
      powerPlanEnergyScheduleData,
      siteOrderAmount,
      Number(htDataPoint.quantity)
    ];
  }

  private createCustomHTMLContent(
    company: string,
    period,
    ordre,
    realise,
    PA?
  ): string {
    if (company !== 'producer') {
      return (
        '<div style="padding:15px; font-size: 18px; line-height: 30px">' +
        '<td><u><b><div class="period">Période: </b></td>' +
        period +
        '</u></div> ' +
        '<td><b>PA : </b></td>' +
        '<td>' +
        PA +
        ' MW' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<br><td><b>Ordre : </b></td>' +
        '<td>' +
        ordre +
        ' MW' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<br><td><b>Télérelevé : </b></td>' +
        '<td>' +
        realise +
        ' MW' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '<br><td><b>Ajustement réel : </b></td>' +
        '<td>' +
        (PA - realise) +
        ' MW' +
        '</td>' +
        '</tr>' +
        '<tr>' +
        '</table>' +
        '</div>'
      );
    }

    return (
      '<div style="padding:15px; font-size: 18px; line-height: 30px">' +
      '<td><u><b><div class="period">Période: </b></td>' +
      period +
      '</u></div> ' +
      '<td><b>Ordre : </b></td>' +
      '<td>' +
      ordre +
      ' MW' +
      '</td>' +
      '</tr>' +
      '<tr>' +
      '<br><td><b>Télérelevé : </b></td>' +
      '<td>' +
      realise +
      ' MW' +
      '</td>' +
      '</tr>' +
      '<tr>' +
      '</table>' +
      '</div>'
    );
  }

  private createTimeStampInShortFormat(timeStamp: string): string {
    return new DateTime().createTimeStampInShortFormat(timeStamp);
  }
}
