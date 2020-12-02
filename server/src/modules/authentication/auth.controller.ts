/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginDto} from './dto/Login.dto';
import {ApiOperation, ApiResponse} from '@nestjs/swagger';
import {AuthenticationResponseDto} from './dto/AuthenticationResponse.dto';

@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({description: 'Authenticate a user'})
  @ApiResponse({
    status: 201,
    description:
      'Returns a valid JWT token when the correct credentials are provided',
    type: AuthenticationResponseDto
  })
  public async login(
    @Body() credentials: LoginDto
  ): Promise<AuthenticationResponseDto> {
    return await this.authService.login(credentials);
  }
}
