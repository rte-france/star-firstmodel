/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {
  HttpException,
  HttpStatus,
  Injectable
} from '@nestjs/common';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import {IUser} from '../../common/interfaces/user.interface';
import {UserDto} from './dto/User.dto';
import {LoginDto} from './dto/Login.dto';
import {AuthenticationResponseDto} from './dto/AuthenticationResponse.dto';
import {IOrganization} from '../../common/interfaces/organization.interface';
import {Log} from '../../common/utils/logging/Log';
import {AuthenticationInfo} from '../../common/enum/AuthenticationInfo';
import {AuthenticationError} from '../../common/enum/AuthenticationError';


@Injectable()
export class AuthService {

  private readonly secret: string;
  private readonly users: IUser[];
  private activeToken: string;
  
  public constructor() {

    try {
      this.secret = JSON.parse(fs.readFileSync(process.env.AUTHENTICATION_SECRET, 'utf8'))['secret'];
      this.users = JSON.parse(fs.readFileSync(process.env.AUTHENTICATION_CONFIGURATION_PATH, 'utf8'))['users'];
    }
    catch (error) {
      Log.server.error(AuthenticationError.CONFIGURATION_FAILURE, error);
//      throw new Error(AuthenticationError.CONFIGURATION_FAILURE + error);
      process.exit(1);
    }
  }


  public async login(credentials: LoginDto): Promise<AuthenticationResponseDto> {
    const token: string = await this.authenticateUser(credentials);
    
    return {token};
  }


  public setToken(token: string): void {
    
    this.activeToken = token;
  }


  public getOrganization(): IOrganization {
    const decodedToken = jwt.verify(this.activeToken, this.secret);

    return {
      organizationId: decodedToken.user.organizationId,
      role: decodedToken.user.role
    };
  }


  public getUserFromToken(): IUser {
    return jwt.verify(this.activeToken, this.secret).user;
  }


  public validateUserPermission(): boolean {

    try {
      const decodedUser = jwt.verify(this.activeToken, this.secret).user;
      
      let validUser: boolean = false;
      for (const  user of this.users) {
        if (user.userEmail === decodedUser.userEmail) {
          validUser = true;
        }
      }
      
      return validUser;
    }
    catch (error) {
      Log.server.info(AuthenticationError.TOKEN_FAILURE, error.message);    

      return false;
    }
  }


  private async authenticateUser(credentials: LoginDto): Promise<string> {
    const user: IUser = this.findUser(credentials);

    if (!user) {
      throw new HttpException(
        AuthenticationError.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED
      );
    }

    return await this.generateToken(user);
  }


  private findUser(credentials: LoginDto): IUser {
  
    return this.users.find(
      (existingUser) =>
        existingUser.userEmail === credentials.userEmail &&
        bcrypt.compareSync(credentials.password, existingUser.password)
    );
  }

  private async generateToken(userIn: IUser): Promise<string> {
    const user: UserDto = userIn;
    
    return await jwt.sign(
      {user},
      this.secret,
      {expiresIn: '1d'}
    );

  }

}

