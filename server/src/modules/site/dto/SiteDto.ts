/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiProperty} from '@nestjs/swagger';

export class SiteDto {
  @ApiProperty({
    type: String,
    example: '',
    description: 'Site Id automatically generated at the site creation'
  })
  public siteId: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'eda-45678fghj-3456gdhhy-ggb5467',
    description:
      'EDA Id automatically generated at the EDA creation and linked to the Site'
  })
  public edaRegisteredResourceId: string;

  @ApiProperty({
    type: String,
    required: true,
    isArray: true,
    example: ['AUT750'],
    description: 'NAZA automata Id automatically generated'
  })
  public nazaRegisteredResourceMrid: string[];

  @ApiProperty({
    type: String,
    required: true,
    example: 'Enedis',
    description: 'IEC code identifying the DSO to which the site is connected '
  })
  public a04RegisteredResourceMrid: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'MV',
    description:
      '"Injection HV / Injection MV\n' +
      'HV stands for High Voltage (HTB)\n' +
      'MV stands for Medium Voltage (HTA)"'
  })
  public voltageType: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'PRM64800000001240',
    description: 'Site code of the site, prefixed by PRM, PDL or CARD'
  })
  public objectAggregationMeteringPoint: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Parc eolien des dunes',
    description: 'Name of the Site'
  })
  public siteName: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '139738',
    description: 'SIRET number of the Site'
  })
  public siteSIRET: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Pyla',
    description: 'Geographical location of the site'
  })
  public siteLocation: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'DSO',
    description: 'Name of the DSO (A04 System Operator)'
  })
  public a04Name: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Injection',
    description:
      'Defines whether the site is on the production side (Injection) or the demand side (Withdrawal)'
  })
  public siteType: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '17X100A100A0001A',
    description: 'IEC code identifying the site'
  })
  public siteIEC: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'Groupe eolien du vent',
    description: 'Name of the producer'
  })
  public producerName: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'producer',
    description: 'IEC code identifying the producer'
  })
  public producerIEC: string;
}
