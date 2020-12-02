/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiProperty} from '@nestjs/swagger';

export class OrderActivationDocumentDto {
  @ApiProperty({
    type: String,
    example: 'order-45678fghj-3456gdhhy-ggb5467',
    description: 'Order Id automatically generated at the site creation'
  })
  public orderId: string;

  @ApiProperty({
    type: String,
    example: 'AUT750',
    description: 'NAZA automata Id automatically generated '
  })
  public nazaRegisteredResourceMrid: string;

  @ApiProperty({
    type: Number,
    required: true,
    example: 0,
    description: 'Target Power Quantity requested by the automaton'
  })
  public orderAllValue: number;

  @ApiProperty({
    type: String,
    required: true,
    example: '1584230400',
    description:
      'The date and hours when the automate has sent the order (UNIX Format). (YYYY-MM-DDTHH-MM-SS Z -> Cf conversion Xsd to JSON)'
  })
  public createdDateTime: string;

  @ApiProperty({
    type: String,
    required: true,
    isArray: true,
    example: ['PRM00000000234766'],
    description: 'List of all site codes impacted by the order'
  })
  public objectAggregationMeteringPoint: string[];

  @ApiProperty({
    type: String,
    required: true,
    isArray: true,
    example: ['17X100A100R00182'],
    description:
      'IEC codes of all DSOs impacted by the order. (A04 System Operator)'
  })
  public a04RegisteredResourceMrid: string[];

  @ApiProperty({
    type: String,
    required: false,
    example: 'MW',
    description: 'Unit of power quantity (ex: MW)'
  })
  public measurementUnitName?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '1',
    description: 'Version of the document'
  })
  public revisionNumber?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A53',
    description:
      '"Type of the activation\n' +
      '\n' +
      'Possible options \n' +
      'If existing - the contrary of A41 - Activation response\n' +
      'A53 - Outage publication Document\n' +
      'A54 - Forced Outage publication Document\n' +
      'B28 - Move of scheduled production"'
  })
  public type?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: "TSO's mRID"
  })
  public senderMarketParticipantMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: 'BSP / Producer mRID  (in current phase "TOR")'
  })
  public receiverMarketParticipantMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A41',
    description:
      '"Role type of the receiverMarketParticipants. Ex: \n' +
      '- A41 (BSP)  \n' +
      '- A21 (Producer)"'
  })
  public receiverMarketParticipantMarketRoleType?: string;
}
