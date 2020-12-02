/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiProperty} from '@nestjs/swagger';
import {IsEmail} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({type: String})
  public userEmail: string;

  @ApiProperty({type: String})
  public password: string;
}
