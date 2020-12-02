/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiProperty} from '@nestjs/swagger';

export class EDPDto {
  @ApiProperty({
    type: String,
    example: '',
    description:
      'EDP Id automatically generated at the EDA creation and linked with the PPES'
  })
  public edpRegisteredResourceId: string;

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
    example: 'EDPA',
    description: 'Name of the EDP'
  })
  public edpRegisteredResourceName: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '17X000000822909',
    description:
      'EDP code used to identify an EDP (Entité de Programmation). This field is used for information only, as the automatically generated edpId is used to link the PPES to the EDP '
  })
  public edpRegisteredResourceMrid: string;
}
