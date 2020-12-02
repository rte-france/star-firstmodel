/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Site} from './site';

export class Eda {
  public edaRegisteredResourceId: string;
  public a46Name: string;
  public edaRegisteredResourceName: string;
  public edaRegisteredResourceMrid: string;
  public sites?: Site[];
  public selected?: boolean;
}
