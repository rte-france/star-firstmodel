/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {ApiModelProperty} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class AuthenticationResponseDto {
  @ApiModelProperty({type: String})
  public token: string;
}
