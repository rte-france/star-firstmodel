/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


export class UserDto {
  public constructor(
    public userName: string,
    public userFirstName: string,
    public userLastName: string,
    public userEmail: string,
    public password: string,
    public company: string,
    public role: string
  ) {}
}
