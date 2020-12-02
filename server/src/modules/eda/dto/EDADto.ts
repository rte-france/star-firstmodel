/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiProperty} from '@nestjs/swagger';

export class EDADto {
  @ApiProperty({
    type: String,
    example: '',
    description:
      'EDA Id automatically generated at the EDA creation and linked to the Site'
  })
  public edaRegisteredResourceId: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'BSP1',
    description: 'Name of the associated BSP'
  })
  public a46Name: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'OCEANT 1',
    description: 'Name of the EDA (ex: OCEANT 1)'
  })
  public edaRegisteredResourceName: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '674846',
    description: 'EDA code identifying an EDA'
  })
  public edaRegisteredResourceMrid: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '17X000000822909',
    description: 'IEC code of the Balacing Service Provider (BSP - A46)'
  })
  public a46IEC: string;
}
