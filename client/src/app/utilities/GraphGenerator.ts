/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {graphConfiguration} from '../components/logged-in/historique/history-table/GraphConfiguration';
import {Activation} from '../models/activation';
import {ActivationService} from '../services/activation/activation-service';

export class GraphGenerator {
  public constructor(private _activationService: ActivationService) {}

  public generate(activation: Activation, company: string): void {
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    const isPowerPlanEnergyScheduleDataAvailable: boolean = this.isPowerPlanEnergyScheduleDataAvailable(
      activation
    );

    const plotData = this._activationService.setActivationGraphData(
      activation,
      isPowerPlanEnergyScheduleDataAvailable,
      company
    );

    function drawChart() {
      const data = new google.visualization.DataTable();

      data.addColumn('string', 'Time');
      data.addColumn({type: 'string', role: 'tooltip', p: {html: true}});

      if (isPowerPlanEnergyScheduleDataAvailable) {
        data.addColumn('number', 'PA');
      } else {
        data.addColumn('number', '');
      }

      data.addColumn('number', 'Ordre');
      data.addColumn('number', 'Télérelevé');
      data.addRows(plotData);

      const chart = new google.visualization.SteppedAreaChart(
        document.getElementById(activation.siteOrderId)
      );

      chart.draw(data, graphConfiguration);
    }
  }

  private isPowerPlanEnergyScheduleDataAvailable(
    activation: Activation
  ): boolean {
    return activation.dataPowerPlanEnergySchedule.length !== 0;
  }
}
