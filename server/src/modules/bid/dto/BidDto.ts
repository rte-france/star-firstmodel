/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiProperty} from '@nestjs/swagger';
import {Point} from '../../../models/Point';

export class BidDto {
  @ApiProperty({
    type: String,
    example: '',
    description:
      'Bid Id automatically generated at the bid creation and linked with the offer'
  })
  public bidId: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'eda-45678fghj-3456gdhhy-ggb5467',
    description:
      'EDA Id automatically generated at the EDA creation and linked with the bid'
  })
  public edaRegisteredResourceId: string;

  @ApiProperty({
    type: String,
    required: true,
    isArray: true,
    example: 674846,
    description: 'EDA code identifying an EDA'
  })
  public edaRegisteredResourceMrid: string;

  @ApiProperty({
    type: String,
    required: true,
    example: 'TJHE783',
    description:
      '"Reference of the bid Market Document\n' +
      '\n' +
      'RR_AAMMJJ_HHMM-HHMM_EDA_RéferenceOffre AAMMJJ : Jour de livraison (UTC)\n' +
      'HHMM : heure de début et de fin de livraison (UTC) RéférenceOffre : code du Support d’Offre (EDA) Num : numéro à 6 chiffres\n' +
      'Ex : RR_170428_0800_0900_SO1_000011"'
  })
  public bidRegisteredResourceMrid: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '1584230400',
    description:
      'For each of all 288 points on the bid, we have amount of power expected between two timestamps'
  })
  public timeIntervalStart: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '1584316800',
    description: 'The end timestamp of the last point of the bid'
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
    example: 'Euro',
    description:
      'Unit in which the value of the points of the bid is expressed (ex: MW)'
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
      'For each of all 288 points on the bid we have the price asked between two timestamps'
  })
  public timeSeries: Point[];

  @ApiProperty({type: String, example: '1570917601'})
  public timestamp?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A37',
    description: 'A37 (reserve bid document) - CIM standard'
  })
  public type?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A30',
    description:
      '"A30 - Tertiary reserve process \n' +
      '\n' +
      'A47 - Manual Frequency Restoration Reserve (mFRR)\n' +
      ' -  CIM standard"'
  })
  public processType?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: "AA's Mrid  -  CIM standard"
  })
  public senderMarketParticipantMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A46',
    description: 'A46 - Balancing Service Provider  -  CIM standard'
  })
  public senderMarketParticipantMarketRoleType?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: "TSO's Mrid -  CIM standard"
  })
  public receiverMarketParticipantMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A48',
    description: "TSO's Role A48 LFC Operator -  CIM standard"
  })
  public receiverMarketParticipantMarketRoleType?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '1584230400',
    description:
      'The date and hours when the automate has sent the order (UNIX Format). (YYYY-MM-DDTHH-MM-SS Z -> Cf conversion Xsd to JSON) -  CIM standard'
  })
  public createdDateTime?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'IEC France',
    description: 'IEC France - CIM standard'
  })
  public domainMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: "BSP's Mrid - CIM standard"
  })
  public subjectMarketParticipantMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'B74',
    description: 'B74 (bid) - CIM standard'
  })
  public businessType?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'IEC France',
    description: 'IEC France - domain as described in CIM standard'
  })
  public acquiringDomainMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'IEC France',
    description: 'IEC France - domain as described in CIM standard'
  })
  public connectingDomainMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '',
    description: 'Producer MrId'
  })
  public providerMarketParticipantMrid?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'MAW',
    description: 'MAW - CIM standard'
  })
  public quantityMeasureUnitName?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'EUR',
    description: 'Currency used in for the bid'
  })
  public currencyUnitName?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'MWH',
    description: 'MWH - CIM standard'
  })
  public priceMeasureUnitName?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A02',
    description: 'A02: non divisible - CIM standard'
  })
  public divisible?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A01',
    description: '"A01: up bid\n' + 'A02: down bid -  CIM standard"'
  })
  public flowDirection?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'A01',
    description:
      '"2 types need to be covered : \n' +
      'A03 (break points) - used for PPES in TOPASE today \n' +
      'A01 (Sequential Fixed Sized Blocks "'
  })
  public curveType?: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '1000',
    description: 'Price'
  })
  public priceAmount?: string;
}
