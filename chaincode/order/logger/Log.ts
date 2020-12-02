/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/


import {Logger} from 'winston';
import {LoggerFactory} from './LoggerFactory';

export class Log {
  public static chaincode: Logger = LoggerFactory.chaincode;
}
