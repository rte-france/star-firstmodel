/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiProperty} from '@nestjs/swagger';
import {Point} from '../../../models/Point';

export class MVDto {
  @ApiProperty({
    type: String,
    example: '',
    description: 'MRID of the (EA) document'
  })
  public energyAccountMarketDocumentMrid: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'site-45678fghj-3456gdhhy-ggb5467',
    description: 'Site Id automatically generated at the site creation'
  })
  public siteId: string;

  @ApiProperty({
    type: String,
    required: true,
    isArray: true,
    example: 'PRM64800000001240',
    description:
      '"Site code of the site, prefixed by PRM, PDL or CARD\n' +
      'Refers to EAR\'s ObjectAggregation (Object_AGGREGATION.MeteringPoint (A02) "'
  })
  public objectAggregationMeteringPoint: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '1584230400',
    description: 'The start timestamp of the first point of the Metering file'
  })
  public timeIntervalStart: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '1584316800',
    description: 'The end timestamp of the last point of the Metering file'
  })
  public timeIntervalEnd: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 300,
    description: 'Time between each point in UNIX format (300 for 5 minutes)'
  })
  public resolution: number;

  @ApiProperty({
    type: String,
    required: true,
    example: 'mW.h',
    description:
      'Unit in which the value of the points of the Metering file is expressed (ex: MW)'
  })
  public pointType: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'UTC+1',
    description:
      'Time zone used for the timestamp on the Call program (ex: UTC+1)'
  })
  public timeZone: string;

  @ApiProperty({
    type: String,
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
      'For each of all 288 points on the MV we have amount of power sent between two timestamps'
  })
  public timeSeries: Point[];

  @ApiProperty({
    type: Number,
    required: false,
    example: 1,
    description: 'Version of the document'
  })
  public revisionNumber?: number;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A11',
    description: 'Always A11 (Aggregated Energy Data Report)'
  })
  public type?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A02',
    description: 'Always A02 - Final'
  })
  public docStatus?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A05',
    description: 'Always A05 - Metered Data Aggregation'
  })
  public processType?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A02',
    description: 'Always A02 - Summary'
  })
  public classificationType?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: 'MRID of the DSO'
  })
  public senderMarketParticipantMRID?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A04',
    description: 'Role Code of the DSO'
  })
  public senderMarketParticipantRole?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: '"MRID of the TSO (MV Energy Account)\n' + 'MV specific"'
  })
  public receiverMarketParticipantMRID?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A48',
    description: 'Role Code of the TSO - A48 LFC Operator'
  })
  public receiverMarketParticipantMarketRoleType?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '1584230400',
    description: 'Date and time of EA Market document creation'
  })
  public createdDateTime?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'MWH',
    description: 'Name of measurement unit'
  })
  public measurementUnitName?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description:
      'A harmonised domain represents abstract objects used in the electricity market necessary for  the  management  of  various  processes,  resources  or  areas, with  the characteristics described in the "THE HARMONISED ELECTRICITY MARKET ROLE MODEL"'
  })
  public areaDomain?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: 'EIC code'
  })
  public marketEvaluationPointMrid?: string;
}
