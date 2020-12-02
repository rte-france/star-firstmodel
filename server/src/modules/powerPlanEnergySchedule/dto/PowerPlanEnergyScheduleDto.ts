/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiProperty} from '@nestjs/swagger';
import {Point} from '../../../models/Point';

export class PowerPlanEnergyScheduleDto {
  @ApiProperty({
    type: String,
    example: '',
    description: 'PPES Id automatically generated at the site creation'
  })
  public powerPlanEnergyScheduleId: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'edp-45678fghj-3456gdhhy-ggb5467',
    description:
      'EDP Id automatically generated at the EDA creation and linked with the PPES'
  })
  public edpRegisteredResourceId: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '89370633',
    description:
      'EDP code used to identify an EDP (Entité de Programmation). This field is used for information only, as the automatically generated edpId is used to link the PPES to the EDP '
  })
  public edpRegisteredResourceMrid: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '1584230400',
    description: 'The start timestamp of the first point of the PPES'
  })
  public timeIntervalStart: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '1584316800',
    description: 'The end timestamp of the last point of the PPES'
  })
  public timeIntervalEnd: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 300,
    description: 'Time between each point in UNIX format (300 for 5 minutes)'
  })
  public resolution: number;

  @ApiProperty({
    type: String,
    required: true,
    example: 'MW',
    description:
      'Unit in which the value of the points of the PPES is expressed (ex: MW)'
  })
  public pointType: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'UTC+1',
    description:
      'Timezone used for the timestamp on the Call program (ex: UTC+1)'
  })
  public timeZone: string;

  @ApiProperty({
    type: Point,
    isArray: true,
    required: true,
    example: [
      {
        idPoint: '1',
        quantity: '3',
        timeStampStart: '1584230400',
        timeStampEnd: '1584230700'
      }
    ],
    description:
      '"For each of all 288 points on the Call program we have amount of power expected between two timestamps\n' +
      '\n' +
      'Position replaces idPoint"'
  })
  public timeSeries: Point[];

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: ''
  })
  public powerPlanEnergyScheduleMrid: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: ''
  })
  public powerPlanEnergyScheduleStatus: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: ''
  })
  public curveType: string;
}
