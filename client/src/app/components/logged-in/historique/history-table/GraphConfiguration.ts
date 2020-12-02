/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


const legend = 'none';

export const graphConfiguration = {
  focusTarget: 'category',
  tooltip: {isHtml: true},
  hAxis: {
    textStyle: {
      color: '#7d7d7d',
      fontName: 'Avenir, Helvetica, sans-serif',
      fontSize: 11
    },
    showTextEvery: 3
  },
  vAxis: {
    textStyle: {
      color: '#7d7d7d',
      fontName: 'Avenir, Helvetica, sans-serif',
      fontSize: 11
    },
    showTextEvery: 1,
    gridlines: {
      color: 'transparent'
    }
  },
  colors: ['#E86C90', '#086BC8', '#51BA00'],
  series: {
    1: {lineWidth: 7, lineDashStyle: [2, 2]}
  },
  areaOpacity: 0,
  legend: legend as 'none',
  height: 350,
  width: 1400
};
